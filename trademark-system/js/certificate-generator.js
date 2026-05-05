/**
 * 商标证生成器 - 基于 HTML5 Canvas 动态绘制带水印的商标注册证
 * @param {Object} trademarkData
 *   - trademarkName {string} 商标名称
 *   - registerNo {string} 商标注册号
 *   - licensee {string} 注册人/被授权人
 *   - goodsServices {string} 核定使用商品/服务
 *   - regDate {string} 注册日期
 *   - validDate {string} 有效期至
 * @param {string} watermarkText 水印文字
 * @returns {Object} { dataUrl: string, fileName: string }
 */
function generateCertificate(trademarkData, watermarkText) {
  var W = 800;
  var H = 1132;
  var canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  var ctx = canvas.getContext('2d');

  // ===== 1. 白色背景 =====
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  // ===== 2. 金色/深蓝色装饰边框线 =====
  var margin = 40;
  var innerW = W - margin * 2;
  var innerH = H - margin * 2;

  // 外框细线（深蓝）
  ctx.strokeStyle = '#1e3a5f';
  ctx.lineWidth = 2;
  ctx.strokeRect(margin, margin, innerW, innerH);

  // 内框细线（金色）
  ctx.strokeStyle = '#c9a84c';
  ctx.lineWidth = 1;
  ctx.strokeRect(margin + 8, margin + 8, innerW - 16, innerH - 16);

  // 顶部装饰横线（金色）
  ctx.beginPath();
  ctx.moveTo(margin + 30, margin + 60);
  ctx.lineTo(W - margin - 30, margin + 60);
  ctx.strokeStyle = '#c9a84c';
  ctx.lineWidth = 3;
  ctx.stroke();

  // 底部装饰横线（金色）
  ctx.beginPath();
  ctx.moveTo(margin + 30, H - margin - 60);
  ctx.lineTo(W - margin - 30, H - margin - 60);
  ctx.stroke();

  // ===== 3. 标题「商标注册证」=====
  ctx.textAlign = 'center';
  ctx.fillStyle = '#1a1a1a';
  ctx.font = 'bold 42px "Microsoft YaHei", "PingFang SC", sans-serif';
  ctx.fillText('商标注册证', W / 2, margin + 130);

  // 标题下分隔线
  ctx.beginPath();
  ctx.moveTo(W / 2 - 120, margin + 150);
  ctx.lineTo(W / 2 + 120, margin + 150);
  ctx.strokeStyle = '#c9a84c';
  ctx.lineWidth = 2;
  ctx.stroke();

  // ===== 4. 商标图样占位区域 =====
  var boxX = W / 2 - 120;
  var boxY = margin + 190;
  var boxW = 240;
  var boxH = 160;
  ctx.strokeStyle = '#d1d5db';
  ctx.lineWidth = 1;
  ctx.setLineDash([6, 4]);
  ctx.strokeRect(boxX, boxY, boxW, boxH);
  ctx.setLineDash([]);
  ctx.fillStyle = '#9ca3af';
  ctx.font = '18px "Microsoft YaHei", sans-serif';
  ctx.fillText('商标图样', W / 2, boxY + boxH / 2 + 6);

  // ===== 5. 信息项绘制辅助函数 =====
  var startY = boxY + boxH + 50;
  var lineHeight = 52;
  var labelX = margin + 50;
  var valueX = margin + 200;
  var maxValueW = innerW - 220;

  function drawLabelValue(label, value, y) {
    ctx.textAlign = 'left';
    ctx.fillStyle = '#6b7280';
    ctx.font = '16px "Microsoft YaHei", sans-serif';
    ctx.fillText(label, labelX, y);

    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 17px "Microsoft YaHei", sans-serif';

    // 自动换行处理
    var words = [];
    var text = value || '—';
    var maxWidth = maxValueW;
    for (var i = 0; i < text.length; i++) {
      var testLine = words.join('') + text[i];
      var metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && words.length > 0) {
        ctx.fillText(words.join(''), valueX, y);
        words = [text[i]];
        y += 24;
      } else {
        words.push(text[i]);
      }
    }
    if (words.length > 0) {
      ctx.fillText(words.join(''), valueX, y);
    }
    return y;
  }

  var d = trademarkData || {};
  var currentY = startY;

  currentY = drawLabelValue('商标名称：', d.trademarkName || '—', currentY) + lineHeight - 24;
  currentY = drawLabelValue('商标注册号：', d.registerNo || '—', currentY) + lineHeight - 24;
  currentY = drawLabelValue('注册人/被授权人：', d.licensee || '—', currentY) + lineHeight - 24;
  currentY = drawLabelValue('核定使用商品/服务：', d.goodsServices || '第9类：计算机软件；智能手机；可穿戴设备', currentY) + lineHeight - 24;
  currentY = drawLabelValue('注册日期：', d.regDate || '—', currentY) + lineHeight - 24;
  currentY = drawLabelValue('有效期至：', d.validDate || '—', currentY) + lineHeight - 24;

  // ===== 6. 底部发证机关和日期 =====
  var footerY = H - margin - 110;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#6b7280';
  ctx.font = '15px "Microsoft YaHei", sans-serif';
  ctx.fillText('发证机关：国家知识产权局商标局', W / 2, footerY);

  var today = new Date();
  var dateStr = today.getFullYear() + '年' + (today.getMonth() + 1) + '月' + today.getDate() + '日';
  ctx.fillText('发证日期：' + dateStr, W / 2, footerY + 28);

  // ===== 7. 全屏斜向水印层 =====
  if (watermarkText) {
    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = '#888888';
    ctx.font = 'bold 22px "Microsoft YaHei", sans-serif';
    ctx.textAlign = 'left';

    var watermarkSpacingX = 280;
    var watermarkSpacingY = 200;
    var rows = Math.ceil(H / watermarkSpacingY) + 4;
    var cols = Math.ceil(W / watermarkSpacingX) + 4;

    for (var r = -2; r < rows; r++) {
      for (var c = -2; c < cols; c++) {
        ctx.save();
        var wx = c * watermarkSpacingX;
        var wy = r * watermarkSpacingY + (c % 2) * (watermarkSpacingY / 2);
        ctx.translate(wx, wy);
        ctx.rotate(-Math.PI / 4);
        ctx.fillText(watermarkText, 0, 0);
        ctx.restore();
      }
    }
    ctx.restore();
  }

  // ===== 8. 返回 DataURL =====
  var dataUrl = canvas.toDataURL('image/png');
  var fileName = '商标证_' + (d.trademarkName || '未知') + '_' + (d.registerNo || '未知') + '.png';
  return { dataUrl: dataUrl, fileName: fileName };
}

/**
 * 触发浏览器自动下载图片
 * @param {string} dataUrl
 * @param {string} fileName
 */
function downloadCertificate(dataUrl, fileName) {
  var a = document.createElement('a');
  a.href = dataUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * 显示全屏 Loading 遮罩
 * @param {string} text
 */
function showLoadingOverlay(text) {
  var overlay = document.createElement('div');
  overlay.id = 'certLoadingOverlay';
  overlay.style.cssText =
    'position:fixed;top:0;left:0;width:100%;height:100%;' +
    'background:rgba(15,23,42,0.55);z-index:9999;' +
    'display:flex;align-items:center;justify-content:center;';
  overlay.innerHTML =
    '<div style="background:#fff;border-radius:12px;padding:32px 48px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.2);">' +
    '<div style="width:40px;height:40px;border:3px solid #e2e8f0;border-top-color:#2563eb;border-radius:50%;margin:0 auto 16px;animation:certSpin 1s linear infinite;"></div>' +
    '<div style="font-size:15px;font-weight:500;color:#1e293b;">' + (text || '处理中...') + '</div>' +
    '</div>' +
    '<style>@keyframes certSpin{to{transform:rotate(360deg)}}</style>';
  document.body.appendChild(overlay);
}

/**
 * 隐藏 Loading 遮罩
 */
function hideLoadingOverlay() {
  var overlay = document.getElementById('certLoadingOverlay');
  if (overlay) overlay.remove();
}
