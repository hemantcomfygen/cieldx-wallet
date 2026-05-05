import React from 'react'
import { useParams } from 'react-router-dom';
import SwapComponent from '../components/swap/SwapBox';

const Swap = () => {
  const { id } = useParams();
  return (
    <>
      <SwapComponent id={id} />
    </>
  )
}

export default Swap