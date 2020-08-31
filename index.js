#!/usr/bin/env node

const colors = require("colors/safe")
const fs = require("fs-extra")
const parseArgs = require("minimist")

const args = parseArgs(process.argv.slice(2))

const rootCml = "./CMakeLists.txt"


if(!("name" in args))
{
	console.log(colors.red(" *** Please specify the project name through --name <path>"))
	process.exit(-1)
}

var name = args.name
var primary = false
var rcmlExists = fs.existsSync(rootCml)
var type = ""

if(!("primary" in args) && !("secondary" in args))
{
	if(rcmlExists)
	{
		console.log(" - CMakeLists.txt exists; --primary not provided, assuming secondary")
		primary = false
	}
	else
	{
		console.log(" - CMakeLists.txt doesn't exist; --secondary not provided, assuming primary")
		primary = true
	}
}
else
{
	if('primary' in args && 'secondary' in args)
	{
		console.log(colors.red(" *** Ambiguity detected: --primary and --secondary both defined"))
		process.exit(-1)
	}

	if("primary" in args)
	{
		primary = true
	}
	else if("secondary" in args)
	{
		if(!rcmlExists && !("ignore-nonfatal" in args))
		{
			console.log(colors.red(" *** Secondary projects require a CMakeLists.txt present in the directory.\n     Please create a primary project first or specify --ignore-nonfatal."))
			process.exit(-1)
		}

		primary = false
	}
}

if(!primary)
{
	if("type" in args)
		type = args.type;
	else
	{
		console.log(" - Project type not provided; assuming executable")
		type = "executable"
	}

	if(type != "executable" && type != "stlib" && type != "dylib")
	{
		console.log(colors.red(` *** Invalid project type ${type}`))
		process.exit(-1)
	}
}

var directory = ""
if(primary)
	directory = "."
else
	directory = name

if("directory" in args)
	directory = args.directory

console.log()
console.log(colors.bold(` - Creating ${(primary) ? "primary" : "secondary"} CMake project ${colors.green(name)} @ '${directory}'`))

fs.ensureDirSync(directory)

var path = directory + "/CMakeLists.txt"
if(primary)
{
	fs.appendFileSync(path,
`
cmake_minimum_required (VERSION 3.8)
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

project ("${name}")\n
`
		)
}
else
{
	fs.appendFileSync(path,
`
set(CMW_ProjectName ${name})
`
		)

	switch(type)
	{
	case "executable":
		fs.writeFileSync(directory + `/${name}.cpp`, "")
		fs.appendFileSync(path, `add_executable (\${CMW_ProjectName} ${name}.cpp)\n`)
		break;
	case "stlib":
		fs.writeFileSync(directory + `/${name}.cpp`, "")
		fs.writeFileSync(directory + `/${name}.hpp`, "")
		fs.appendFileSync(path, `add_library (\${CMW_ProjectName} STATIC ${name}.cpp ${name}.hpp)\n`)
		break;
	case "dylib":
		fs.writeFileSync(directory + `/${name}.cpp`, "")
		fs.writeFileSync(directory + `/${name}.hpp`, "")
		fs.appendFileSync(path, `add_library (\${CMW_ProjectName} SHARED ${name}.cpp ${name}.hpp)\n`)
		break;
	}

	if(rcmlExists)
		fs.appendFileSync(rootCml, `add_subdirectory(${directory})\n`)
}
