export function hello() {
    console.log("Hello world")
}

export function sayHello(name) {
    console.log("Hello ${name}")
}

export default {hello, sayHello}