/**
 * Type declarations для CSS/SCSS модулей
 */

declare module '*.css' {
  const content: string;
  export default content;
}

declare module '*.scss' {
  const content: string;
  export default content;
}
