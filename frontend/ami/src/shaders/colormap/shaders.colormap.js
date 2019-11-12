import PastelsColormap from './colormap.pastels';
import GRBWColormap from './colormap.GRBW';
import GrayscaleColormap from './colormap.grayscale';

function shadersColormap(baseFragment, colormap, value, tLower, tMul, color) {
    let cm = 'grayscale';
    switch (colormap) {
        case 'pastels':
            return PastelsColormap.api(baseFragment, value, tLower, tMul, color);
        
        case 'GRBW':
            return GRBWColormap.api(baseFragment, value, tLower, tMul, color);
        
        default:
            return GrayscaleColormap.api(baseFragment, value, tLower, tMul, color);
    }
}

export default shadersColormap;