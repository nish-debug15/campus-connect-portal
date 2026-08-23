const fs = require('fs');
fetch('https://www.admissionwala.in/service/1/345/rv-university')
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
