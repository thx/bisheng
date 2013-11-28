if (!console.group) {
    console._log = console.log
    console._indent = ''
    console._styles = {
        //styles
        'bold': ['\033[1m', '\033[22m'],
        'italic': ['\033[3m', '\033[23m'],
        'underline': ['\033[4m', '\033[24m'],
        'inverse': ['\033[7m', '\033[27m'],
        //grayscale
        'white': ['\033[37m', '\033[39m'],
        'grey': ['\033[90m', '\033[39m'],
        'black': ['\033[30m', '\033[39m'],
        //colors
        'blue': ['\033[34m', '\033[39m'],
        'cyan': ['\033[36m', '\033[39m'],
        'green': ['\033[32m', '\033[39m'],
        'magenta': ['\033[35m', '\033[39m'],
        'red': ['\033[31m', '\033[39m'],
        'yellow': ['\033[33m', '\033[39m']
    }

    console.log = function() {
        var args = [].slice.call(arguments, 0)
        if (args[0] === '[context]') args[0] = console._styles.green[0] + args[0] + console._styles.green[1]
        if (args[0] === '[options]') args[0] = console._styles.yellow[0] + args[0] + console._styles.yellow[1]
        if (console._indent) {
            args = args.join(' ').split('')
            for (var i = 0, len = args.length; i < len; i++) {
                if (i > 0 && i % 150 === 0) args.splice(i, 0, '\n' + console._indent)
            }
            args = [args.join('')]
            args = [console._indent.slice(0, console._indent.length - 4) + '├── '].concat(args)
        }
        console._log.apply(console, args)
    }

    console.group = function() {
        var args = [].slice.call(arguments, 0),
            style = console._styles.bold;
        args[0] = style[0] + args[0] + style[1]
        console.log.apply(console, args)

        console._indent += '│   ' // │ ├ ─ ─
    }
    console.groupEnd = function() {
        console._indent = console._indent.slice(0, console._indent.length - 4)
    }

}