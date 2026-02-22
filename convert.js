import sharp from 'sharp';
import fs from 'fs';

sharp('public/social-card.svg')
  .png()
  .toFile('public/social-card.png')
  .then(() => console.log('Successfully converted social-card.svg to social-card.png'))
  .catch(err => {
    console.error('Conversion Failed', err);
    process.exit(1);
  });
