
cmake_minimum_required (VERSION 3.8)
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

project ("MyTestProject")

add_subdirectory(network)
add_subdirectory(client)
add_subdirectory(server)
