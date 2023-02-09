
# react-vgrid

## for the moment just start it

`yarn && yarn start`

#### TODO
- [x] basic captions
- [x] fix the loader
- [x] add the hover, out and click event handlers
- [x] caption filters global
- [x] caption filters multiple fields
- [x] filters smart set/reset   
- [ ] sorters (in captions) [WIP](https://github.com/fedeghe/react-vgrid/tree/sorting)
- [x] groups (config and captions)
- [x] collapsible groups
- [x] but even before try to think a flexible way to allow those to be headless
- [ ] completely adapt the config consuption so that the react-vtable one can be used seamlessly for react-vgrid (done partially)







# react-vgrid

## install

`yarn add @fedeghe/react-vgrid`

React-vgrid creates a virtualized container. It renders only the very minimum amount of Items, and starting from computing the height all Items would occupy creates a top and bottom _filling_ domnode with the right height so to allow the scrollbar to stay as if all elements were rendered. A constraint imposed by this approach is that every Item will have a fixed height (defaulted to `80px`) and also the grid size need to be setted (defaulted to `1200px * 800px`).  

WIP

