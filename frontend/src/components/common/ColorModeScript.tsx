import {  IconButton, useColorMode } from '@chakra-ui/react'
import React from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';

const ColorModeSwitch = () => {
  const {toggleColorMode, colorMode} = useColorMode();
  const isDark = colorMode === "dark";
  return (
    <IconButton
      icon={isDark ? <FaSun /> : <FaMoon />}
      onClick={toggleColorMode}
      variant="outline"
      borderRadius="3xl"
      color={isDark ? 'orange' : 'blackAlpha.800'}
      size="lg" aria-label={''}    />
  )
}

export default ColorModeSwitch