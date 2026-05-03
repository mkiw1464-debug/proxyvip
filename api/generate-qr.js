import chromium from 'chrome-aws-lambda';

export default async function handler(req, res) {
  const { amount, username } = req.body; 
  let browser = null;

  try {
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath,
      headless: true,
    });

    const page = await browser.newPage();
    
    // 1. LOGIN SEAGM
    await page.goto('https://www.seagm.com/signin', { waitUntil: 'networkidle2' });
    await page.type('#email', 'mkiw1464@gmail.com');
    await page.type('#password', 'wumrygpahku3nunnIq');
    await page.click('#signin_button'); 
    await page.waitForNavigation();

    // 2. TERUS KE PAGE TNG (RM10/20/30/50/100)
    await page.goto('https://www.seagm.com/tng-reload-pin-malaysia', { waitUntil: 'networkidle2' });
    
    // Pilih amaun berdasarkan input (RM10, RM20, etc.)
    const [target] = await page.$x(`//span[contains(text(), 'RM${amount}')]`);
    if (target) await target.click();

    // 3. CHECKOUT & DUITNOW
    await page.waitForSelector('.btn-buy-now');
    await page.click('.btn-buy-now');
    
    await page.waitForSelector('.payment-method-duitnow');
    await page.click('.payment-method-duitnow');
    await page.click('#place_order_button');

    // 4. GRAB ORDER ID & SCREENSHOT QR
    await page.waitForSelector('.qr-code-image'); // Ganti dengan selector sebenar
    const qrElement = await page.$('.qr-code-image');
    const qrBase64 = await qrElement.screenshot({ encoding: 'base64' });
    
    // Ambil Order ID dari URL atau Page untuk rujukan 'Refresh' nanti
    const currentUrl = page.url();
    const orderId = currentUrl.split('/').pop(); 

    res.status(200).json({ 
      success: true, 
      qr: `data:image/png;base64,${qrBase64}`,
      orderId: orderId 
    });

  } catch (e) {
    res.status(500).json({ error: e.message });
  } finally {
    if (browser) await browser.close();
  }
}
