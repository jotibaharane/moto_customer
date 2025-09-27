import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Guideline sizes (based on standard 375x812 screen like iPhone X)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

/**
 * Returns a scaled width value based on the device screen width.
 * @param size The base size you want to scale
 */
export const wp = (size: number): number => (SCREEN_WIDTH / BASE_WIDTH) * size;

/**
 * Returns a scaled height value based on the device screen height.
 * @param size The base size you want to scale
 */
export const hp = (size: number): number =>
  (SCREEN_HEIGHT / BASE_HEIGHT) * size;

/**
 * Returns a moderately scaled size useful for font, padding, and margins.
 * @param size The base size you want to scale
 * @param factor How much scaling to apply (default: 0.5)
 */
export const ms = (size: number, factor: number = 0.5): number =>
  size + (wp(size) - size) * factor;

/**
 * Returns a font size adjusted for device font scaling settings.
 * @param size The base font size
 */
export const fontSize = (size: number): number =>
  size * PixelRatio.getFontScale();
