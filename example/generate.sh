#! /usr/bin/env bash

cmake-wizard --name MyTestProject --primary
cmake-wizard --name network --secondary --type=stlib
cmake-wizard --name client --secondary --type=executable
cmake-wizard --name server --secondary --type=executable
