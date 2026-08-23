const fs = require('fs');
fetch('https://rvu.edu.in/')
  .then(r => r.text())
  .then(html => {
    const regex = /<img[^>]+src=["']([^"']+\.(jpg|jpeg|png|webp))["']/gi;
    let match;
    const urls = new Set();
    while ((match = regex.exec(html)) !== null) {
      urls.add(match[1]);
    }
    console.log(Array.from(urls));
  });
