"use strict";
const visitor_as_1 = require("visitor-as");
const utils_1 = require("visitor-as/dist/utils");
function getTypeName(type) {
    let _type = utils_1.getName(type);
    const OR_NULL = /\|.*null/;
    if (type.isNullable && !OR_NULL.test(_type)) {
        _type = `${_type} | null`;
    }
    return _type;
}
class MethodInjector extends visitor_as_1.BaseVisitor {
    constructor() {
        super(...arguments);
        this.encodeStmts = [];
        this.decodeCode = [];
    }
    visitFieldDeclaration(node) {
        const name = utils_1.toString(node.name);
        if (!node.type) {
            throw new Error(`Field ${name} is missing a type declaration`);
        }
        const type = getTypeName(node.type);
        // Keys can only be keys/number I think...
        if (type == "string") {
            this.encodeStmts.push(`encoded += '' + '"' + '${name}' + '"' + ':' + JSON.stringify<${type}>(this.${name}) + ',';`);
        }
        else if (type == "number" || type == "i8" || type == "u8" || type == "i16" || type == "u16" || type == "i32" || type == "u32" || type == "i64" || type == "u64") {
            this.encodeStmts.push(`encoded += '' + '${name}' + '' + ':' + JSON.stringify<${type}>(this.${name}) + ',';`);
        }
        this.decodeCode.push(`${name}: JSON.parse<${type}>(values[${this.decodeCode.length}]),\n`);
    }
    visitClassDeclaration(node) {
        if (!node.members) {
            return;
        }
        this.currentClass = node;
        const name = utils_1.getName(node);
        this.encodeStmts = [];
        this.decodeCode = [];
        this.visit(node.members);
        const encodeMethod = `
    __encode(): string {
      let encoded: string = "";
      ${this.encodeStmts.join(";\n\t")};
      return encoded
    }
    `;
        const decodeMethod = `
    __decode(values: Array<string>): ${name} {
      const decoded: ${name} = {
        ${this.decodeCode.join("")}
      }
      return decoded
    }
    `;
        const encodeMember = visitor_as_1.SimpleParser.parseClassMember(encodeMethod, node);
        node.members.push(encodeMember);
        const decodeMember = visitor_as_1.SimpleParser.parseClassMember(decodeMethod, node);
        node.members.push(decodeMember);
    }
    static visit(node) {
        new MethodInjector().visit(node);
    }
}
class Encoder extends visitor_as_1.Decorator {
    visitClassDeclaration(node) {
        MethodInjector.visit(node);
    }
    get name() {
        return "serializable";
    }
    get sourceFilter() {
        return (_) => true;
    }
}
module.exports = visitor_as_1.registerDecorator(new Encoder());
//# sourceMappingURL=transform.js.map