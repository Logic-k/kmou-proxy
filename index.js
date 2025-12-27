const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/api/notices', async (req, res) => {
  try {
    const url = "https://www.kmou.ac.kr/kmou/na/ntt/selectNttList.do?mi=2032&bbsId=10373";
    const { data } = await axios.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const $ = cheerio.load(data);
    const notices = [];

    // 해양대 공지사항 테이블 행(tr) 순회
    $('.nttListTable tbody tr').each((i, el) => {
      const row = $(el);
      // '공지' 배지나 번호가 없는 빈 행 제외
      const num = row.find('td.num').text().trim();
      if (!num) return;

      const titleAnchor = row.find('td.nttTitle a');
      const title = titleAnchor.text().trim();
      const link = titleAnchor.attr('href');
      const writer = row.find('td.writer').text().trim();
      const date = row.find('td.date').text().trim();

      notices.push({
        number: num,
        title: title,
        author: writer,
        date: date,
        url: "https://www.kmou.ac.kr" + link
      });
    });

    res.json(notices);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch notices" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));