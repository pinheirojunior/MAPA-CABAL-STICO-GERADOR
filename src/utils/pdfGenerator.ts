import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { CabalisticMapData } from './cabalisticMap.js';
import { sanitizeText } from '../pdf/pdfBuilder.js';

// HELPER: Formatação rigorosa de data para o padrão brasileiro (DD/MM/AAAA)
function formatDateBR(dateStr: string): string {
  if (!dateStr) return '';
  const clean = dateStr.trim();

  // YYYY-MM-DD ou YYYY-MM-DDT...
  if (/^\d{4}-\d{2}-\d{2}/.test(clean)) {
    const parts = clean.split('T')[0].split('-');
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  // YYYY/MM/DD
  if (/^\d{4}\/\d{2}\/\d{2}/.test(clean)) {
    const parts = clean.split('/');
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  // DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}/.test(clean)) {
    const [p1, p2, year] = clean.split('/');
    const n1 = parseInt(p1, 10);
    const n2 = parseInt(p2, 10);
    if (n1 > 12) {
      return clean;
    }
    if (n2 > 12) {
      return `${p2.padStart(2, '0')}/${p1.padStart(2, '0')}/${year}`;
    }
    return clean;
  }

  // Fallback ISO ou Date parse
  const d = new Date(clean);
  if (!isNaN(d.getTime())) {
    const day = String(d.getUTCDate()).padStart(2, '0');
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const year = d.getUTCFullYear();
    return `${day}/${month}/${year}`;
  }

  return clean;
}

export async function generateMapPDF(orderId: string, mapData: CabalisticMapData): Promise<string> {
  const pdfDir = path.join(process.cwd(), 'data', 'pdfs');
  if (!fs.existsSync(pdfDir)) {
    fs.mkdirSync(pdfDir, { recursive: true });
  }

  const filePath = path.join(pdfDir, `mapa-${orderId}.pdf`);

  // ETAPA 9: Reutiliza PDF se já existente e íntegro
  if (fs.existsSync(filePath)) {
    try {
      const stats = fs.statSync(filePath);
      if (stats.size > 2000) {
        return filePath;
      }
    } catch {
      // continua para geração caso ocorra erro
    }
  }

  return new Promise((resolve, reject) => {
    try {
      const PDFDoc = (PDFDocument as any).default || PDFDocument;
      const doc = new PDFDoc({
        size: 'A4',
        margin: 45,
        bufferPages: true,
        autoFirstPage: true,
        info: {
          Title: `Mapa Cabalístico Personalizado - ${sanitizeText(mapData.userInfo.fullName)}`,
          Author: 'MAPA CABALÍSTICO PERSONALIZADO',
          Subject: 'Estudo Numerológico e Cabalístico',
          Keywords: 'Numerologia, Cabala, Autoconhecimento, PDF'
        }
      });

      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);

      // PALETA DE CORES DA CAPA
      const coverBg = '#0b0914';
      const coverBox = '#161224';
      const purplePrimary = '#7c3aed';
      const goldAccent = '#d97706';
      const goldBright = '#f59e0b';
      const textLight = '#f8fafc';

      // PALETA DAS PÁGINAS INTERNAS (Off-white de alto contraste para leitura estilo livro)
      const internalBg = '#faf8f5';
      const boxLightBg = '#f3f0f9';
      const boxGoldBg = '#fef3c7';
      const textDark = '#1e293b';
      const textMutedDark = '#475569';
      const purpleTitle = '#3b0764';
      const purpleBorder = '#c084fc';
      const goldTitle = '#b45309';
      const goldBorder = '#f59e0b';

      const leftMargin = 45;
      const contentWidth = 505.28;
      const marginTop = 50;
      const maxY = 770;

      let cursorY = marginTop;

      // CLASSE REGISTRADORA E VALIDADORA DE LAYOUT (BOUNDING BOX & OVERLAP PREVENTION)
      class LayoutTracker {
        private boxes: { type: string; pageIndex: number; x: number; y: number; width: number; height: number }[] = [];
        private lastBottomYPerPage: Map<number, number> = new Map();

        public register(type: string, pageIndex: number, x: number, y: number, width: number, height: number): void {
          if (height <= 0 || width <= 0) return;
          this.boxes.push({ type, pageIndex, x, y, width, height });

          const currentMax = this.lastBottomYPerPage.get(pageIndex) || 0;
          this.lastBottomYPerPage.set(pageIndex, Math.max(currentMax, y + height));
        }

        public ensureNoOverlap(pageIndex: number, candidateY: number, minSpacing: number = 0): number {
          const lastBottom = this.lastBottomYPerPage.get(pageIndex);
          if (lastBottom !== undefined && candidateY < lastBottom + minSpacing) {
            return lastBottom + minSpacing;
          }
          return candidateY;
        }

        public validate(totalPages: number): void {
          const overlaps: string[] = [];
          for (let p = 0; p < totalPages; p++) {
            const pageBoxes = this.boxes.filter(b => b.pageIndex === p).sort((a, b) => a.y - b.y);
            for (let i = 0; i < pageBoxes.length - 1; i++) {
              const b1 = pageBoxes[i];
              const b2 = pageBoxes[i + 1];
              const b1Bottom = b1.y + b1.height;
              if (b2.y < b1Bottom - 0.5) {
                overlaps.push(`Página ${p + 1}: [${b1.type}] (Y: ${b1.y.toFixed(1)}-${b1Bottom.toFixed(1)}) sobrepõe [${b2.type}] (Y: ${b2.y.toFixed(1)}-${(b2.y + b2.height).toFixed(1)})`);
              }
            }
          }

          if (overlaps.length > 0) {
            console.error('ALERTA DE SOBREPOSIÇÃO DETECTADA NO GERADOR DE PDF (pdfGenerator):');
            overlaps.forEach(o => console.error('  - ' + o));
          }
        }
      }

      const layoutTracker = new LayoutTracker();

      // Event listener para preencher automaticamente o fundo nas páginas internas
      doc.on('pageAdded', () => {
        doc.save();
        doc.rect(0, 0, doc.page.width, doc.page.height).fill(internalBg);
        doc.restore();
        cursorY = marginTop;
        doc.y = marginTop;
      });

      const ensureSpace = (neededHeight: number) => {
        if (cursorY + neededHeight > maxY && cursorY > marginTop) {
          doc.addPage();
        }
      };

      const renderSectionTitle = (title: string, subtitle?: string) => {
        const cleanTitleText = sanitizeText(title);
        const cleanSubText = subtitle ? sanitizeText(subtitle) : undefined;

        doc.fontSize(22).font('Helvetica-Bold');
        const measuredTitleH = doc.heightOfString(cleanTitleText, {
          width: contentWidth,
          align: 'left'
        });

        let measuredSubH = 0;
        if (cleanSubText) {
          doc.fontSize(13.5).font('Helvetica');
          measuredSubH = doc.heightOfString(cleanSubText, {
            width: contentWidth,
            align: 'left'
          });
        }

        const subGap = cleanSubText ? (8 + measuredSubH) : 0;
        const lineGap = 10;
        const lineThick = 1.2;
        const spaceAfter = 18;
        const totalHeaderH = measuredTitleH + subGap + lineGap + lineThick + spaceAfter;

        const keepWithNext = 60;
        ensureSpace(totalHeaderH + keepWithNext);

        let currentPage = doc.bufferedPageRange().count - 1;
        cursorY = layoutTracker.ensureNoOverlap(currentPage, cursorY, 0);
        const startY = cursorY;

        doc.save();

        doc.fillColor(purpleTitle)
           .fontSize(22)
           .font('Helvetica-Bold')
           .text(cleanTitleText, leftMargin, cursorY, { width: contentWidth, align: 'left' });

        cursorY += measuredTitleH;

        if (cleanSubText) {
          cursorY += 8;
          doc.fillColor(textMutedDark)
             .fontSize(13.5)
             .font('Helvetica')
             .text(cleanSubText, leftMargin, cursorY, { width: contentWidth, align: 'left' });
          cursorY += measuredSubH;
        }

        cursorY += lineGap;
        doc.moveTo(leftMargin, cursorY)
           .lineTo(leftMargin + contentWidth, cursorY)
           .strokeColor(goldAccent)
           .lineWidth(lineThick)
           .stroke();

        cursorY += lineThick + spaceAfter;
        doc.restore();

        currentPage = doc.bufferedPageRange().count - 1;
        layoutTracker.register('section_title', currentPage, leftMargin, startY, contentWidth, cursorY - startY - spaceAfter);
      };

      const renderParagraph = (text: string, spaceAfter = 14) => {
        const cleanRaw = sanitizeText(text);
        if (!cleanRaw) return;

        const paragraphs = cleanRaw.split('\n\n');
        for (const p of paragraphs) {
          const cleanP = p.trim();
          if (!cleanP) continue;

          doc.fontSize(14).font('Helvetica');
          const pHeight = doc.heightOfString(cleanP, {
            width: contentWidth,
            align: 'justify',
            lineGap: 5.5
          });

          const printablePageH = maxY - marginTop;
          if (pHeight <= printablePageH && cursorY + pHeight > maxY && cursorY > marginTop) {
            doc.addPage();
          }

          let currentPage = doc.bufferedPageRange().count - 1;
          cursorY = layoutTracker.ensureNoOverlap(currentPage, cursorY, 0);
          const startY = cursorY;

          doc.save();
          doc.fillColor(textDark)
             .fontSize(14)
             .font('Helvetica')
             .text(cleanP, leftMargin, cursorY, {
               width: contentWidth,
               align: 'justify',
               lineGap: 5.5
             });
          doc.restore();

          currentPage = doc.bufferedPageRange().count - 1;
          const endY = Math.max(doc.y, startY + pHeight);
          layoutTracker.register('paragraph', currentPage, leftMargin, startY, contentWidth, endY - startY);

          cursorY = endY + spaceAfter;
        }
      };

      // HELPER: Renderização determinística e padronizada do componente gráfico do indicador (Badge)
      const renderBadgeGraphic = (
        targetDoc: any,
        badgeX: number,
        badgeY: number,
        badgeW: number,
        badgeH: number,
        badgeValue: string | number,
        accentColor: string,
        borderColor: string
      ) => {
        targetDoc.save();

        // Quadrado colorido do badge
        targetDoc.rect(badgeX, badgeY, badgeW, badgeH)
                 .fill(accentColor)
                 .strokeColor(borderColor)
                 .lineWidth(1)
                 .stroke();

        // Formatação do valor do número e cálculo dinâmico de fonte
        const valStr = String(badgeValue).trim();
        let numFontSize = 24;
        if (valStr.length >= 3) {
          numFontSize = 18;
        }
        if (valStr.length >= 4) {
          numFontSize = 14;
        }

        // Centralização exata vertical e horizontal dentro do quadrado do badge
        targetDoc.fontSize(numFontSize).font('Helvetica-Bold');
        const numH = targetDoc.heightOfString(valStr, { width: badgeW, align: 'center' });
        const numY = badgeY + (badgeH - numH) / 2;

        targetDoc.fillColor('#ffffff')
                 .fontSize(numFontSize)
                 .font('Helvetica-Bold')
                 .text(valStr, badgeX, numY, {
                   width: badgeW,
                   align: 'center'
                 });

        targetDoc.restore();
      };

      const renderCardBox = (options: {
        title: string;
        badgeValue?: string | number;
        bodyText: string;
        bgColor: string;
        borderColor: string;
        accentColor: string;
        titleColor: string;
        spaceAfter?: number;
      }) => {
        const cleanTitle = sanitizeText(options.title);
        const cleanBody = sanitizeText(options.bodyText);
        const spaceAfter = options.spaceAfter ?? 16;
        const hasBadge = options.badgeValue !== undefined;

        // Configurações do Badge
        const badgeW = 65;
        const badgeH = 58;
        const badgeMarginRight = 16;
        const badgeX = leftMargin + contentWidth - badgeMarginRight - badgeW;

        // Largura útil para o texto dentro do card garantindo área independente (sem sobreposição com badge)
        const textWidth = hasBadge ? (contentWidth - 16 - 16 - badgeW - 16) : (contentWidth - 32);

        doc.fontSize(15.5).font('Helvetica-Bold');
        const titleH = doc.heightOfString(cleanTitle, {
          width: textWidth,
          align: 'left'
        });

        doc.fontSize(13.5).font('Helvetica');
        const textH = doc.heightOfString(cleanBody, {
          width: textWidth,
          align: 'justify',
          lineGap: 5
        });

        const topPad = 14;
        const gap = 8;
        const botPad = 14;
        const minBoxH = hasBadge ? (topPad + badgeH + botPad) : 58;
        const contentH = topPad + titleH + gap + textH + botPad;
        const boxH = Math.max(minBoxH, contentH);
        const printablePageH = maxY - marginTop;

        if (boxH <= printablePageH) {
          if (cursorY + boxH > maxY && cursorY > marginTop) {
            doc.addPage();
          }

          let currentPage = doc.bufferedPageRange().count - 1;
          cursorY = layoutTracker.ensureNoOverlap(currentPage, cursorY, 0);
          const boxY = cursorY;

          doc.save();

          doc.rect(leftMargin, boxY, contentWidth, boxH)
             .fill(options.bgColor)
             .strokeColor(options.borderColor)
             .lineWidth(1)
             .stroke();

          doc.rect(leftMargin, boxY, 5, boxH)
             .fill(options.accentColor);

          doc.fillColor(options.titleColor)
             .fontSize(15.5)
             .font('Helvetica-Bold')
             .text(cleanTitle, leftMargin + 16, boxY + topPad, { width: textWidth, align: 'left' });

          if (hasBadge) {
            const badgeY = boxY + topPad;
            renderBadgeGraphic(doc, badgeX, badgeY, badgeW, badgeH, options.badgeValue!, options.accentColor, options.borderColor);
          }

          const textY = boxY + topPad + titleH + gap;
          doc.fillColor(textDark)
             .fontSize(13.5)
             .font('Helvetica')
             .text(cleanBody, leftMargin + 16, textY, {
               width: textWidth,
               align: 'justify',
               lineGap: 5
             });

          doc.restore();

          layoutTracker.register('card_box', currentPage, leftMargin, boxY, contentWidth, boxH);
          cursorY = boxY + boxH + spaceAfter;
        } else {
          // Para textos muito longos (> 720pt), renderiza o cabeçalho do card (com o mesmo componente gráfico do badge) e fluxo contínuo
          const headerH = Math.max(topPad + badgeH + botPad, topPad + titleH + botPad);

          if (cursorY + headerH > maxY && cursorY > marginTop) {
            doc.addPage();
          }

          let currentPage = doc.bufferedPageRange().count - 1;
          cursorY = layoutTracker.ensureNoOverlap(currentPage, cursorY, 0);
          const headerY = cursorY;

          doc.save();

          // Fundo e acento do cabeçalho do card
          doc.rect(leftMargin, headerY, contentWidth, headerH)
             .fill(options.bgColor)
             .strokeColor(options.borderColor)
             .lineWidth(1)
             .stroke();

          doc.rect(leftMargin, headerY, 5, headerH)
             .fill(options.accentColor);

          // Título do Card
          doc.fillColor(options.titleColor)
             .fontSize(15.5)
             .font('Helvetica-Bold')
             .text(cleanTitle, leftMargin + 16, headerY + topPad, { width: textWidth, align: 'left' });

          // Badge
          if (hasBadge) {
            const badgeY = headerY + topPad;
            renderBadgeGraphic(doc, badgeX, badgeY, badgeW, badgeH, options.badgeValue!, options.accentColor, options.borderColor);
          }

          doc.restore();

          layoutTracker.register('card_header', currentPage, leftMargin, headerY, contentWidth, headerH);
          cursorY = headerY + headerH + 12;

          renderParagraph(cleanBody, spaceAfter);
        }
      };

      // =========================================================================
      // PÁGINA 1: CAPA
      // =========================================================================
      doc.rect(0, 0, doc.page.width, doc.page.height).fill(coverBg);

      doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
         .strokeColor(goldAccent)
         .lineWidth(1.5)
         .stroke();

      doc.rect(26, 26, doc.page.width - 52, doc.page.height - 52)
         .strokeColor(purplePrimary)
         .lineWidth(0.5)
         .stroke();

      const centerX = doc.page.width / 2;
      doc.save();
      doc.strokeColor(goldBright).lineWidth(1.2);
      doc.circle(centerX, 130, 34).stroke();
      doc.circle(centerX, 130, 24).stroke();
      doc.circle(centerX, 130, 14).stroke();
      doc.restore();

      const fullNameClean = sanitizeText(mapData.userInfo.fullName);
      const birthDateClean = formatDateBR(sanitizeText(mapData.userInfo.formattedBirthDate || mapData.userInfo.birthDate));

      doc.fillColor(goldBright)
         .fontSize(13)
         .font('Helvetica-Bold')
         .text('ESTUDO NUMEROLÓGICO INDIVIDUAL', 0, 185, { align: 'center' });

      doc.fillColor(textLight)
         .fontSize(30)
         .font('Helvetica-Bold')
         .text('MAPA CABALÍSTICO', 0, 220, { align: 'center' });

      doc.fillColor(purplePrimary)
         .fontSize(22)
         .font('Helvetica-Bold')
         .text('PERSONALIZADO', 0, 258, { align: 'center' });

      doc.moveTo(140, 295).lineTo(doc.page.width - 140, 295).strokeColor(goldAccent).lineWidth(1).stroke();

      doc.fillColor(goldBright).fontSize(11).font('Helvetica-Bold').text('PREPARADO EXCLUSIVAMENTE PARA:', 0, 350, { align: 'center' });
      doc.fillColor(textLight).fontSize(24).font('Helvetica-Bold').text(fullNameClean, 0, 375, { align: 'center' });

      doc.fillColor(goldBright).fontSize(11).font('Helvetica-Bold').text('DATA DE NASCIMENTO:', 0, 435, { align: 'center' });
      doc.fillColor(textLight).fontSize(17).font('Helvetica').text(birthDateClean, 0, 455, { align: 'center' });

      doc.rect(110, 670, doc.page.width - 220, 65).fill(coverBox).strokeColor(purplePrimary).lineWidth(1).stroke();
      doc.fillColor(goldBright).fontSize(9.5).font('Helvetica-Bold').text(`CÓDIGO DE REGISTRO: ${orderId}`, 0, 686, { align: 'center' });
      doc.fillColor(textLight).fontSize(9.5).font('Helvetica').text(`DATA DE EMISSÃO: ${new Date().toLocaleDateString('pt-BR')}`, 0, 706, { align: 'center' });

      // =========================================================================
      // PÁGINAS INTERNAS
      // =========================================================================
      doc.addPage();

      renderSectionTitle('1. SÍNTESE DOS NÚMEROS CABALÍSTICOS', 'Os seis indicadores vibracionais do seu pedido');

      const items = [
        { label: 'NÚMERO DE DESTINO', val: mapData.numbers.destino, desc: 'Caminho de Vida e Tendências' },
        { label: 'EXPRESSÃO DO NOME', val: mapData.numbers.expressao, desc: 'Talentos Visíveis e Nome' },
        { label: 'ALMA (MOTIVAÇÃO)', val: mapData.numbers.alma, desc: 'Anseios Profundos e Vogais' },
        { label: 'PERSONALIDADE', val: mapData.numbers.personalidade, desc: 'Impressão Social e Consoantes' },
        { label: 'MISSÃO DE VIDA', val: mapData.numbers.missao, desc: 'Propósito Maior de Existência' },
        { label: 'ANO PESSOAL', val: mapData.numbers.anoPessoal, desc: 'Ciclo Energético Vigente' },
      ];

      items.forEach((item) => {
        renderCardBox({
          title: item.label,
          badgeValue: item.val,
          bodyText: item.desc,
          bgColor: boxLightBg,
          borderColor: purpleBorder,
          accentColor: purpleTitle,
          titleColor: purpleTitle,
          spaceAfter: 14
        });
      });

      renderCardBox({
        title: 'ELEMENTO & GUIA ESPIRITUAL',
        bodyText: `Elemento de Regência: ${mapData.element}\nArcanjo Guia: ${mapData.arcanoAnjo}\nProteção: ${mapData.salmoProtecao}`,
        bgColor: boxGoldBg,
        borderColor: goldBorder,
        accentColor: goldTitle,
        titleColor: goldTitle,
        spaceAfter: 20
      });

      renderSectionTitle('2. INTERPRETAÇÃO VIBRACIONAL DETALHADA', 'Análise aprofundada de cada número');

      const sections = [
        { title: '1. O Caminho de Destino', text: mapData.interpretations.destinoText },
        { title: '2. Expressão do Nome', text: mapData.interpretations.expressaoText },
        { title: '3. A Alma e seus Anseios', text: mapData.interpretations.almaText },
        { title: '4. Sua Personalidade Visível', text: mapData.interpretations.personalidadeText },
        { title: '5. Sua Missão de Vida', text: mapData.interpretations.missaoText },
        { title: '6. Influência do Ano Pessoal', text: mapData.interpretations.anoPessoalText },
      ];

      sections.forEach((sec) => {
        renderCardBox({
          title: sec.title,
          bodyText: sec.text,
          bgColor: boxLightBg,
          borderColor: purpleBorder,
          accentColor: purpleTitle,
          titleColor: purpleTitle,
          spaceAfter: 16
        });
      });

      renderSectionTitle('3. RECOMENDAÇÕES E REORIENTAÇÕES', 'Conselhos práticos para o seu desenvolvimento');

      mapData.interpretations.recomendacoes.forEach((rec) => {
        const cleanRec = sanitizeText(rec);
        if (!cleanRec) return;

        const bulletText = `•  ${cleanRec}`;
        doc.fontSize(13.5).font('Helvetica');
        const recH = doc.heightOfString(bulletText, { width: contentWidth - 15, lineGap: 5 });

        ensureSpace(recH + 6);

        let currentPage = doc.bufferedPageRange().count - 1;
        cursorY = layoutTracker.ensureNoOverlap(currentPage, cursorY, 0);
        const startY = cursorY;

        doc.save();
        doc.fillColor(textDark)
           .fontSize(13.5)
           .font('Helvetica')
           .text(bulletText, leftMargin + 10, cursorY, { width: contentWidth - 15, align: 'justify', lineGap: 5 });
        doc.restore();

        currentPage = doc.bufferedPageRange().count - 1;
        const endY = Math.max(doc.y, startY + recH);
        layoutTracker.register('recommendation_item', currentPage, leftMargin + 10, startY, contentWidth - 15, endY - startY);

        cursorY = endY + 8;
      });

      // Validação de layout
      layoutTracker.validate(doc.bufferedPageRange().count);

      // Rodapé e Numeração de Páginas (Página X de Y)
      const totalPages = doc.bufferedPageRange().count;

      doc.options.autoPageBreak = false;
      doc.page.margins.bottom = 0;
      doc.page.margins.top = 0;

      for (let i = 0; i < totalPages; i++) {
        doc.switchToPage(i);
        doc.page.margins.bottom = 0;
        doc.page.margins.top = 0;
        doc.options.autoPageBreak = false;
        doc.y = 24;

        if (i > 0) {
          doc.save();

          doc.fillColor(textMutedDark)
             .fontSize(8.5)
             .font('Helvetica')
             .text('MAPA CABALÍSTICO PERSONALIZADO — ESTUDO EXCLUSIVO', leftMargin, 24, { width: 320, align: 'left', lineBreak: false });
          doc.moveTo(leftMargin, 36).lineTo(550, 36).strokeColor('#cbd5e1').lineWidth(0.5).stroke();

          doc.moveTo(leftMargin, 805).lineTo(550, 805).strokeColor('#cbd5e1').lineWidth(0.5).stroke();
          doc.fillColor(textMutedDark)
             .fontSize(8.5)
             .font('Helvetica')
             .text(`Consultado: ${fullNameClean}`, leftMargin, 812, { width: 320, align: 'left', lineBreak: false });
          doc.text(`Página ${i + 1} de ${totalPages}`, 400, 812, { width: 150, align: 'right', lineBreak: false });

          doc.restore();
        }

        doc.y = 24;
      }

      doc.switchToPage(totalPages - 1);
      doc.y = 24;

      doc.end();

      writeStream.on('finish', () => resolve(filePath));
      writeStream.on('error', (err) => reject(err));
    } catch (err) {
      reject(err);
    }
  });
}
