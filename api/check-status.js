import chromium from 'chrome-aws-lambda';

export default async function handler(req, res) {
  const { orderId } = req.body;
  let browser = null;

  try {
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath,
      headless: true,
    });

    const page = await browser.newPage();
    
    // Login SEAGM (Sama seperti Step 2)
    // ... logic login ...

    // TERUS KE URL COMPLETED ORDERS
    await page.goto('https://www.seagm.com/en-my/order/list?status=sent', { waitUntil: 'networkidle2' });

    // Cari adakah Order ID tersebut ada dalam senarai 'Sent'
    const isCompleted = await page.evaluate((id) => {
      return document.body.innerText.includes(id);
    }, orderId);

    if (isCompleted) {
      // Logic untuk ambil PIN dari page tersebut
      res.status(200).json({ status: 'SUCCESS', pin: 'MOCK-PIN-1234' });
    } else {
      res.status(200).json({ status: 'PENDING', message: 'Bayaran belum dikesan.' });
    }
  } finally {
    if (browser) await browser.close();
  }
}
