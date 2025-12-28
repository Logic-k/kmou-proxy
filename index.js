const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/api/notices', async (req, res) => {
  try {
    const url = "https://www.kmou.ac.kr/kmou/na/ntt/selectNttList.do?mi=2032&bbsId=10373";
    
    // 404 응답이 와도 내용을 긁어올 수 있도록 validateStatus 추가
    const response = await axios.get(url, {
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://www.kmou.ac.kr/kmou/main.do'
        },
        validateStatus: (status) => status < 500 // 404 에러가 나도 500 미만이면 성공으로 간주
    });

    const $ = cheerio.load(response.data);
    const notices = [];

    $('.nttListTable tbody tr').each((i, el) => {
      const row = $(el);
      const num = row.find('td.num').text().trim();
      if (!num) return;

      const titleAnchor = row.find('td.nttTitle a');
      const title = titleAnchor.text().trim();
      const link = titleAnchor.attr('href');
      const writer = row.find('td.writer').text().trim();
      const date = row.find('td.date').text().trim();

      if (title) {
        notices.push({
          number: num,
          title: title,
          author: writer,
          date: date,
          url: "https://www.kmou.ac.kr" + link
        });
      }
    });

    res.json(notices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));