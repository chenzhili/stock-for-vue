function judge(type) {
    return (value) => {
        type = `${type.slice(0, 1).toUpperCase()}${type.slice(1)}`
        return Object.prototype.toString.call(value) === `[object ${type}]`
    }
}
export const isString = judge("String");
export const isNumber = judge("Number");
export const isBoolean = judge("Boolean");
export const isArray = judge("Array");
export const isObject = judge("Object");
export const isFunction = judge("Function");
export const isNull = judge("Null");
export const isUndefined = judge("Undefined");

const class2type = {};
const core_toString = class2type.toString;
"Boolean Number String Function Array Date RegExp Object Error".split(" ").forEach((name) => {
    class2type[`[object ${name}]`] = name.toLowerCase();
});
export function type(obj) {
    if (obj == null) {
        return String(obj);
    }
    return typeof obj === "object" || typeof obj === "function" ?
        class2type[core_toString.call(obj)] || "object" :
        typeof obj;
}