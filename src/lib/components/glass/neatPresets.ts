import type { NeatConfig } from '@firecms/neat';

/**
 * NEAT WebGL gradient presets — ported verbatim from the 0610 design
 * prototype (glass.jsx). Two palettes share one persistent backdrop:
 * the light "home" surface and the vivid blue "content pages" surface.
 */

/** Light fluid surface behind the home hero. */
export const NEAT_HOME: NeatConfig = {
	colors: [
		{ color: '#E5EBFA', enabled: true },
		{ color: '#2F60DA', enabled: true },
		{ color: '#D9E3FC', enabled: true },
		{ color: '#FFFFFF', enabled: true },
		{ color: '#0045F2', enabled: true }
	],
	speed: 1,
	horizontalPressure: 7,
	verticalPressure: 8,
	waveFrequencyX: 1,
	waveFrequencyY: 2,
	waveAmplitude: 8,
	shadows: 2,
	highlights: 6,
	colorBrightness: 1.1,
	colorSaturation: 2,
	wireframe: false,
	colorBlending: 10,
	backgroundColor: '#003FFF',
	backgroundAlpha: 1,
	grainScale: 4,
	grainSparsity: 0,
	grainIntensity: 0.25,
	grainSpeed: 1,
	resolution: 1,
	yOffset: 0,
	flowEnabled: true,
	flowDistortionA: 1.1,
	flowDistortionB: 0.8,
	flowScale: 1.6,
	flowEase: 0.32,
	shapeType: 'plane',
	cameraLock: true,
	cameraZoom: 1
};

/** Vivid blue variant for the four content pages (bloom + grain + vignette). */
export const NEAT_PAGES: NeatConfig = {
	colors: [
		{ color: '#FFFFFF', enabled: true },
		{ color: '#CCDBFF', enabled: true },
		{ color: '#4D7FFF', enabled: true },
		{ color: '#F3F4F7', enabled: true },
		{ color: '#FFE5AD', enabled: true }
	],
	speed: 2,
	horizontalPressure: 4,
	verticalPressure: 5,
	waveFrequencyX: 4,
	waveFrequencyY: 3,
	waveAmplitude: 2,
	shadows: 5,
	highlights: 7,
	colorBrightness: 1,
	colorSaturation: -3,
	wireframe: false,
	colorBlending: 7,
	backgroundColor: '#00A2FF',
	backgroundAlpha: 1,
	grainScale: 100,
	grainSparsity: 0,
	grainIntensity: 0.05,
	grainSpeed: 0.3,
	resolution: 0.35,
	yOffset: -570,
	yOffsetWaveMultiplier: 5,
	yOffsetColorMultiplier: 4.5,
	yOffsetFlowMultiplier: 5.5,
	flowDistortionA: 0.4,
	flowDistortionB: 3,
	flowScale: 3.3,
	flowEase: 0.53,
	flowEnabled: true,
	domainWarpEnabled: true,
	domainWarpIntensity: 0.05,
	domainWarpScale: 0.5,
	vignetteIntensity: 0,
	vignetteRadius: 0.8,
	bloomIntensity: 0,
	bloomThreshold: 0.7,
	chromaticAberration: 0,
	shapeType: 'plane',
	cameraLock: true,
	cameraZoom: 1
};
