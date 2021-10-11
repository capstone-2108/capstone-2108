import React from 'react'
import ReactDOM from 'react-dom'
import {Provider} from 'react-redux'
import {BrowserRouter} from 'react-router-dom'
import store from '../client/store';
import App from '../client/App';

ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter >
      <App />
    </BrowserRouter>
  </Provider>,
  document.getElementById('app')
);


// const { useEffect, useState } = React;
//
// const useMousePosition = () => {
//   const [mouse, setMouse] = useState({x: 0, y: 0});
//
//   const onMouse = ({clientX, clientY}) => {
//     setMouse({x: clientX, y: clientY});
//   };
//
//   useEffect(() => {
//     window.subscribe('mousemove', onMouse);
//
//     return () => {
//       window.removeEventListener('mousemove', onMouse);
//     };
//   });
//
//   return mouse;
// }
//
// const Brother = () => {
//   const { x, y } = useMousePosition();
//
//   return (
//     <div className="m" style={{
//       left: `${x}px`,
//       top: `${y}px`
//     }}>
//       x: {x}, y: {y}
//     </div>
//   );
// };
//
// const mayIHaveSomeHööks = document.createElement('div');
// document.body.appendChild(mayIHaveSomeHööks);
// ReactDOM.render(<Bröther />, mayIHaveSomeHööks);