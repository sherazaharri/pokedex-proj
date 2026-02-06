import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import bodyLeft from './assets/bodyleft.png'
import bodyRight from './assets/bodyright.png'
import Dexscreen from './components/Dexscreen.jsx'

import './index.css'

function Root(){

  return(
    <div className = 'mainScreen'>
      <img src={bodyLeft} className='bodyLeft'></img>
      <div className='mainBody'>
        <Dexscreen className='dexScreen'></Dexscreen>
      </div>
      <img src={bodyRight} className='bodyRight'></img>
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root></Root>
  </StrictMode>,
)
