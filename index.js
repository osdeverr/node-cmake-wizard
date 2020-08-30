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
var directory = name
var rcmlExists = fs.existsSync(rootCml)

if("directory" in args)
	directory = args.directory

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

console.log()
console.log(colors.bold(` - Creating ${(primary) ? "primary" : "secondary"} CMake project ${colors.green(name)} @ '${directory}'`))

fs.ensureDirSync(directory)

if(primary)
{

}
else
{
	var stream = fs.openSync(directory + "/CMakeLists.txt", "wx")
	stream.write(
`
set(CMW_ProjectName ${name})

`
		)

	if(rcmlExists)
		fs.appendFileSync(rootCml, `add_subdirectory(${directory})`)
}
