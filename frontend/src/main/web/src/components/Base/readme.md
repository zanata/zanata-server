The base component for most other components. It allows other components to
inherit it's props, which are useful for styling with atomic classes.

It should never be used directly, only through another component.

## Example of Base in <Icon />

`<Icon />` uses <Base /> as it's core component.

### Theme

Theme should match the Icon theme objects structure.

    <Icon name='project' size='n1'
      theme={{base: {c: 'C(muted)'}}} />

### Atomic

Atomic class objects for quick style changes.

    <Icon name='project' size='2' atomic={{c: 'C(pri)'}}/>

### Atomic & Theme

Atomic classes can override any theme object **and custom props**.

    <Icon name='project' size='4'
      theme={{base: {c: 'C(pri)'}}}
      atomic={{c: 'C(muted)', h: 'H(ms8)', w: 'W(ms8)'}} />
