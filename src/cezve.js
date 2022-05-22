const fs = require('fs');


const constants = {
    numbers: '0123456789',
    characters: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
    ignores: '\t \r \n'
}

const TokenTypes = {
    IDENT: 'IDENT',
    INT: 'INT',
    FLOAT: 'FLOAT',
    ADD_OP: 'ADD_OP',
    SUB_OP: 'SUB_OP',
    MULT_OP: 'MULT_OP',
    DIV_OP: 'DIV_OP',
    LEFT_PAREN: 'LEFT_PAREN',
    RIGHT_PAREN: 'RIGTH_PAREN',
    EOF: 'EOF',
    KEYWORDS: [
        "ata"
    ]
};

class Token {
    constructor(type, value, positionStart, positionEnd){
        this.type = type;
        this.value  = value;
        this.positionStart = positionStart;
        this.positionEnd = positionEnd;
    }

    toString() {
        if(this.value) return `${this.type}:${this.value}`;
        return this.type;
    }

};


class Lexer {

    constructor(fileName, data) {
        this.fileName = fileName;
        this.data = data;
        this.currentChar = null;
        this.position = -1;
        this.tokens = [];
        this.nextToken();
    }

    nextToken() {
        this.position++;
        if(this.position < this.data.length) {
            this.currentChar = this.data[this.position];
        }else {
            this.currentChar = null;
        }
    }

    start() {
        var tokens = []
        while(this.currentChar != null){
            if(constants.ignores.includes(this.currentChar)){
                this.nextToken()
            } else if(constants.numbers.includes(this.currentChar)){
               tokens.push(this.makeNumber())
            } else if(constants.characters.includes(this.currentChar)){
                tokens.push(this.makeString())
                this.nextToken()
            } else if(this.currentChar == '+'){
                tokens.push(new Token(TokenTypes.ADD_OP, null, this.position))
                this.nextToken()
            } else if(this.currentChar == '-'){
                tokens.push(new Token(TokenTypes.SUB_OP, null, this.position))
                this.nextToken()
            } else if(this.currentChar == '*'){
                tokens.push(new Token(TokenTypes.MULT_OP, null, this.position))
                this.nextToken()
            } else if(this.currentChar == '/'){
                tokens.push(new Token(TokenTypes.DIV_OP, null, this.position))
                this.nextToken()
            }else if(this.currentChar == '('){
                tokens.push(new Token(TokenTypes.LEFT_PAREN, null, this.position))
                this.nextToken()
            }else if(this.currentChar == ')'){
                tokens.push(new Token(TokenTypes.RIGHT_PAREN, null, this.position))
                this.nextToken()
            } else {
                this.nextToken()
            }
        }
        tokens.push(new Token(TokenTypes.EOF, null, this.position))
        return tokens;
    }

    makeNumber(){
        var positionStart = this.position
        var num = '';
        var dotCount = 0;
        var digits = constants.numbers;
        var chars = constants.characters;
        digits += '.';

        while(this.currentChar != null && digits.includes(this.currentChar)) {
            if(this.currentChar == '.'){
                if(dotCount == 1) return console.log(`'${num}' expected float or int`)
                dotCount++;
                num += '.'
            } else {
                num += this.currentChar;
            }
            this.nextToken()
        }

        if(chars.includes(this.currentChar)) {
             throw new Token('Syntax error', num + this.currentChar)
            }


        if(dotCount == 0) {
            return new Token(TokenTypes.INT, parseInt(num), positionStart, this.position);
        } else {
            return new Token(TokenTypes.FLOAT, parseFloat(num), positionStart, this.position)
        }
    }

    makeString() {
        var positionStart = this.position
        var str = '';
        var chars = constants.characters;
        var digits = constants.numbers;

        while(this.currentChar != null && (chars.includes(this.currentChar) || digits.includes(this.currentChar))) {
                str += this.currentChar;
            this.nextToken()
        }

        return new Token(TokenTypes.IDENT, str, positionStart, this.position )

    }

}

/*
******************PARSER*********************
*/


class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.tokenIndex = -1;
        this.next()
    }

    next() {
        this.tokenIndex++;
        if(this.tokenIndex < this.tokens.length){
            this.currentToken = this.tokens[this.tokenIndex];
        }
        return this.currentToken
    }

    parse() {
        let res = this.expr();
        if(this.currentToken.type != TokenTypes.EOF) {
            throw new Error("Expected PARANTHESIS")
        }
        return console.log('Nothing wrong');
    }


    factor() {
        if([TokenTypes.ADD_OP, TokenTypes.SUB_OP].includes(this.currentToken.type)){
            this.next();
            this.factor()
        }else if([TokenTypes.INT, TokenTypes.FLOAT].includes(this.currentToken.type)){
            this.next()
       } else if(this.currentToken.type == TokenTypes.LEFT_PAREN) {
            this.next();
            this.expr();
            if(this.currentToken.type == TokenTypes.RIGHT_PAREN){
                this.next()
            } else {
                throw new Error('something went wrong')
            }
        }
           
       }

    

    term() {
        this.factor();
        while([TokenTypes.MULT_OP, TokenTypes.DIV_OP ].includes(this.currentToken.type) ){
            this.next();
            this.factor();
        }

    }

    expr() {
        this.term();
        while([TokenTypes.ADD_OP, TokenTypes.SUB_OP].includes(this.currentToken.type)){
            this.next();
            this.term()
        }
    }
    
  
    
}



function main(args) {
    args.shift();
    args.shift();
    if(args.length<2) return console.log('Too few argument!');

    if(args[0] == 'compile') {
        var path = args[1];
        if(fs.existsSync(path)){
            var val = fs.readFileSync(path, { encoding: 'utf-8' });
            var lexer = new Lexer(path, val);
            var returns = lexer.start();
            var parser = new Parser(returns)
            parser.parse()
            //console.log(returns)
            
        } else {
            return console.log(`File '${path}' could not be found!`)
        }
    } else {
        return console.log(`Command '${args[0]}' does not exist!`)
    }
}

main(process.argv)