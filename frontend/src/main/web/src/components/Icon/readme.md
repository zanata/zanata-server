## Basic

    const iconList = require('./list');
    <div className='D(f) Flw(w) Flxs(1) Flxg(1) W(100%)'>
      {iconList.map((iconName, i) => (
        <span className='D(ib) M(rq) P(rq) D(f) Fld(c) Ta(c) W(r6)'>
          <Icon key={i} name={iconName} size='3'/>
          <div className='Ff(zmono) C(muted) Fz(msn1) Mt(rq)'>{iconName}</div>
        </span>
      ))}
    </div>

## Size

With a size property. This is based of the modular scale 1-10

    <Icon name='project' size='5'/>

## Theme

Theme should match the Icon theme objects structure

    <Icon name='project' size='n1'
      theme={{base: {c: 'C(muted)'}}} />

## Atomic

Atomic class objects for quick style changes

    <Icon name='project' size='2' atomic={{c: 'C(pri)'}}/>

## Atomic & Theme

Atomic classes can override any theme object **and custom props**.

    <Icon name='project' size='4'
      theme={{base: {c: 'C(pri)'}}}
      atomic={{c: 'C(muted)', h: 'H(ms8)', w: 'W(ms8)'}} />
