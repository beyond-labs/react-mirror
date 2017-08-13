Changelog
=========

## 2.0.0-alpha.1

* renamed `combine` to `combineEnums`
* renamed `combineSimple` to `combine`
* fixed `combineEventsWith`

## 2.0.0-alpha.2

* fix listening to `$props` & `$state` with static cursor

## 2.0.0-alpha.3

* configure event handling priority

By default multicast streams emit events to sinks in the order they were added. Before `2.0.0-alpha.3` this could lead to strange behaviour:

```js
let events = []

const Emitter = Mirror({
  state(mirror) {
    mirror.$state.observe(() => actions.push('emitter $state'))
    return mirror.$actions.tap(() => actions.push('emitter $actions'))
  }
})()

const Listener = Mirror({
  state(mirror) {
    mirror.one(Emitter).$state.observe(() => actions.push('listener $state'))
    mirror.one(Emitter).$actions.tap(() => actions.push('listener $actions'))
    return most.of(undefined)
  }
})()

// after mounting a single instance of each store
Emitter.dispatch('EVENT')

// ['emitter $actions', 'emitter $state', 'listener $state', 'listener $actions']
console.log(events)
```

Now multicast streams emit events to outside listeners _first_, this means `Listener.$actions` is activated before `Emitter.$state` leading to a more predictable event handling order.

```js
// ['listener $actions', 'emitter $actions', 'listener $state', 'emitter $state']
console.log(events)
```

This is important if one store combines multiple streams from another store, & depends on the order of events relative to each stream (eg, using `combineEventsWith`)

## 2.0.0-alpha.4

* emit `INITIALIZE` before actions dispatched before store creation

## 2.0.0-alpha.5

* no `setState` errors after components unmount
* stores receive `TEARDOWN` properly
