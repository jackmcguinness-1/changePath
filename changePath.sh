if [ "$1" == "-r" ]; then
    if test -e $2; then
        touch treeFile.txt
        find $2 > treeFile.txt
        node changePath.js $2 $1
    else
        echo "That doesn't look like a valid folder or file"
    fi
elif [ "$2" == "-r" ]; then
    if test -e $1; then
        touch treeFile.txt
        find $1 > treeFile.txt
        node changePath.js $1 $2
    else
        echo "That doesn't look like a valid folder or file"
    fi
elif [ "$1" == "--help" ]; then
    echo "the script can run on a single file, on a folder, or recursively on a folder meaning it will check all sub directories"
    echo "to run on a file or folder just run ./changePath.sh x"
    echo "to run it recursively on a folder include an -r flag"
    echo "check the globals in changePath.js for ways to change the behaviour of the script"
else
    if test -e $1; then
        touch treeFile.txt
        find $1 > treeFile.txt
        node changePath.js $1 $2
    else
        echo "That doesn't look like a valid folder or file"
    fi
fi
rm -f treeFile.txt