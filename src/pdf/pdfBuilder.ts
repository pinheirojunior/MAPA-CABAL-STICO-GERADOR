import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { FullCabalisticMap } from '../types/numerology';

/**
 * SANITIZADOR RIGOROSO DE TEXTO PARA RENDERIZAÇÃO EM PDF
 * 
 * - Normaliza Unicode (NFC)
 * - Preserva rigorosamente TODOS os acentos e cedilhas do português brasileiro (á, à, ã, â, é, ê, í, ó, ô, õ, ú, ç)
 * - Remove totalmente emojis, símbolos gráficos de alta codificação não suportados pela fonte do PDFKit
 * - Remove sequências corrompidas e marcadores internos (ex: Ø=Ü¬, Ø<, ß, Ü, ¬, ¼, ¨, &, etc.)
 * - Remove espaços duplicados e quebras de linha defeituosas
 */
export function sanitizeText(text: string | null | undefined): string {
  if (!text) return '';

  let cleaned = String(text);

  // 1. Normalização Unicode NFC
  cleaned = cleaned.normalize('NFC');

  // 2. Remoção de caracteres de controle invisíveis (exceto \n, \r, \t)
  cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '');

  // 3. Remoção de padrões de corrupção identificados (ex: Ø=Ü¬, Ø<ß¨, etc.)
  cleaned = cleaned.replace(/Ø[=<>][Üß][¬¼¨\d]*/g, '');
  cleaned = cleaned.replace(/[ØßÜ¬¼¨]/g, '');

  // 4. Mapeamento / Substituição de emojis e símbolos Unicode especiais por texto/bullet limpo
  cleaned = cleaned
    .replace(/❤️|💕|💖|💗|💘|🏠|💬|🗨️|💭|💼|👔|🏬|💰|💵|💳|🪙|🎨|🎭|🖌️|🌱|🌿|🌳|☘️/g, '')
    .replace(/✦|★|⭐|🌟|✔|✅|☑️/g, '•')
    .replace(/⚠|⚡|🚨/g, '!')
    .replace(/^&\s+/gm, '')
    .replace(/\s+&\s*$/gm, '');

  // 5. Filtro de segurança: Mantém exclusivamente caracteres Latin-1 imprimíveis + acentos do Português
  // Mantém: a-z, A-Z, 0-9, acentos (áàãâéêíóôõúçÁÀÃÂÉÊÍÓÔÕÚÇñÑ), pontuação padrão e espaços
  cleaned = cleaned.replace(/[^\x20-\x7E\xA0-\xFF\n\r\t]/g, '');

  // 6. Limpeza de múltiplos espaços e linhas vazias excessivas
  cleaned = cleaned.replace(/[ \t]+/g, ' ');
  cleaned = cleaned.replace(/\n\s+/g, '\n');

  return cleaned.trim();
}

/**
 * GERADOR EDITORIAL PROFISSIONAL DE PDF PARA MAPA CABALÍSTICO PERSONALIZADO
 * 
 * - Fonte Grande e Confortável (Corpo 12pt, Títulos 22-26pt, Números 32-42pt)
 * - Motor de Fluxo Contínuo Dinâmico (sem coordenadas Y fixas, sem sobreposição)
 * - Eliminação Absoluta de Páginas em Branco e Páginas Órfãs no final
 * - Design de Livro Digital Premium com Paleta de Alto Contraste
 */
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

export async function buildMapPDF(mapData: FullCabalisticMap): Promise<string> {
  const pdfsDir = path.join(process.cwd(), 'data', 'pdfs');
  if (!fs.existsSync(pdfsDir)) {
    fs.mkdirSync(pdfsDir, { recursive: true });
  }

  const filePath = path.join(pdfsDir, `mapa-${mapData.id}.pdf`);

  return new Promise((resolve, reject) => {
    try {
      const PDFDoc = (PDFDocument as any).default || PDFDocument;
      const doc = new PDFDoc({
        size: 'A4',
        margin: 45,
        bufferPages: true,
        autoFirstPage: true,
        info: {
          Title: `Mapa Cabalístico Personalizado - ${sanitizeText(mapData.engineData.inputs.fullName)}`,
          Author: 'MAPA CABALÍSTICO PERSONALIZADO',
          Subject: 'Leitura Numerológica e Cabalística Personalizada',
          Keywords: 'Numerologia, Cabala, Autoconhecimento, PDF'
        }
      });

      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);

      // PALETA DE CORES DA CAPA (Escura / Mística Nobre)
      const coverBg = '#0b0914';
      const coverBox = '#161224';
      const purplePrimary = '#7c3aed';
      const goldAccent = '#d97706';
      const goldBright = '#f59e0b';
      const textLight = '#f8fafc';

      // PALETA DE CORES DAS PÁGINAS INTERNAS (Clara Off-White de Alto Contraste)
      const internalBg = '#faf8f5';        // Fundo off-white suave e descansativo
      const boxLightBg = '#f3f0f9';        // Card lilás suave
      const boxGoldBg = '#fef3c7';         // Card dourado/âmbar suave
      const boxHighlightBg = '#eef2ff';    // Card índigo suave
      const textDark = '#1e293b';          // Slate 800 (Grafite escuro para alta legibilidade)
      const textMutedDark = '#475569';     // Slate 600
      const purpleTitle = '#3b0764';       // Roxo profundo para títulos de seções
      const purpleBorder = '#c084fc';      // Borda suave roxa
      const goldTitle = '#b45309';         // Dourado escuro para destaques
      const goldBorder = '#f59e0b';        // Borda dourada

      // GEOMETRIA E LIMITES DA PÁGINA A4 (595.28 x 841.89 pt)
      const leftMargin = 45;
      const contentWidth = 505.28;        // 595.28 - (2 * 45)
      const marginTop = 50;
      const maxY = 770;                  // Limite inferior do conteúdo antes da linha do rodapé (805 pt)

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
            console.error('ALERTA DE SOBREPOSIÇÃO DETECTADA NO GERADOR DE PDF:');
            overlaps.forEach(o => console.error('  - ' + o));
          }
        }
      }

      const layoutTracker = new LayoutTracker();

      // Event listener para preencher automaticamente o fundo nas páginas internas adicionadas
      doc.on('pageAdded', () => {
        doc.save();
        doc.rect(0, 0, doc.page.width, doc.page.height).fill(internalBg);
        doc.restore();
        cursorY = marginTop;
        doc.y = marginTop;
      });

      // HELPER: Garante espaço na página atual antes de desenhar um bloco
      const ensureSpace = (neededHeight: number) => {
        if (cursorY + neededHeight > maxY && cursorY > marginTop) {
          doc.addPage();
        }
      };

      // HELPER: Título de capítulo / seção com medição exata e dinamicidade universal
      const renderSectionTitle = (title: string, subtitle?: string) => {
        const cleanTitleText = sanitizeText(title);
        const cleanSubText = subtitle ? sanitizeText(subtitle) : undefined;

        // Medição exata da altura do título
        doc.fontSize(20).font('Helvetica-Bold');
        const measuredTitleH = doc.heightOfString(cleanTitleText, {
          width: contentWidth,
          align: 'left'
        });

        // Medição exata da altura do subtítulo (se houver)
        let measuredSubH = 0;
        if (cleanSubText) {
          doc.fontSize(12).font('Helvetica');
          measuredSubH = doc.heightOfString(cleanSubText, {
            width: contentWidth,
            align: 'left'
          });
        }

        // Cálculo dinâmico e rigoroso do bloco de cabeçalho
        const subGap = cleanSubText ? (8 + measuredSubH) : 0;
        const lineGap = 10;
        const lineThick = 1.2;
        const spaceAfter = 16;
        const totalHeaderH = measuredTitleH + subGap + lineGap + lineThick + spaceAfter;

        // Keep-With-Next: Garante o título + 60pt do próximo conteúdo na mesma página
        const keepWithNext = 60;
        ensureSpace(totalHeaderH + keepWithNext);

        let currentPage = doc.bufferedPageRange().count - 1;
        cursorY = layoutTracker.ensureNoOverlap(currentPage, cursorY, 0);
        const startY = cursorY;

        doc.save();

        // 1. Renderiza o título
        doc.fillColor(purpleTitle)
           .fontSize(20)
           .font('Helvetica-Bold')
           .text(cleanTitleText, leftMargin, cursorY, { width: contentWidth, align: 'left' });

        cursorY += measuredTitleH;

        // 2. Renderiza o subtítulo se presente
        if (cleanSubText) {
          cursorY += 8;
          doc.fillColor(textMutedDark)
             .fontSize(12)
             .font('Helvetica')
             .text(cleanSubText, leftMargin, cursorY, { width: contentWidth, align: 'left' });
          cursorY += measuredSubH;
        }

        // 3. Renderiza a linha divisória decorativa
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

      // HELPER: Renderiza parágrafo com medição prévia de altura e fluxo contínuo
      const renderParagraph = (text: string, spaceAfter = 14) => {
        const cleanRaw = sanitizeText(text);
        if (!cleanRaw) return;

        const paragraphs = cleanRaw.split('\n\n');
        for (const p of paragraphs) {
          const cleanP = p.trim();
          if (!cleanP) continue;

          doc.fontSize(12).font('Helvetica');
          const pHeight = doc.heightOfString(cleanP, {
            width: contentWidth,
            align: 'justify',
            lineGap: 4
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
             .fontSize(12)
             .font('Helvetica')
             .text(cleanP, leftMargin, cursorY, {
               width: contentWidth,
               align: 'justify',
               lineGap: 4
             });
          doc.restore();

          currentPage = doc.bufferedPageRange().count - 1;
          const endY = Math.max(doc.y, startY + pHeight);
          layoutTracker.register('paragraph', currentPage, leftMargin, startY, contentWidth, endY - startY);

          cursorY = endY + spaceAfter;
        }
      };

      // HELPER: Renderiza Card / Caixa de Destaque com altura dinâmica pré-medida e suporte a estouro
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
        const badgeW = 60;
        const badgeH = 54;
        const badgeMarginRight = 16;
        const badgeX = leftMargin + contentWidth - badgeMarginRight - badgeW;

        // Largura útil para o texto dentro do card garantindo área independente (sem sobreposição com badge)
        // contentWidth (500) - leftPad (16) - gap (16) - badgeW (60) - rightPad (16) = 392pt
        const textWidth = hasBadge ? (contentWidth - 16 - 16 - badgeW - 16) : (contentWidth - 32);

        // Medição do título do Card (14 pt)
        doc.fontSize(14).font('Helvetica-Bold');
        const titleH = doc.heightOfString(cleanTitle, {
          width: textWidth,
          align: 'left'
        });

        // Medição do corpo do texto (11.5 pt, lineGap 3.5)
        doc.fontSize(11.5).font('Helvetica');
        const textH = doc.heightOfString(cleanBody, {
          width: textWidth,
          align: 'justify',
          lineGap: 3.5
        });

        const topPad = 14;
        const gap = 8;
        const botPad = 14;
        const minBoxH = hasBadge ? (topPad + badgeH + botPad) : 55;
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

          // Fundo do card
          doc.rect(leftMargin, boxY, contentWidth, boxH)
             .fill(options.bgColor)
             .strokeColor(options.borderColor)
             .lineWidth(1)
             .stroke();

          // Barra de acento lateral esquerda
          doc.rect(leftMargin, boxY, 5, boxH)
             .fill(options.accentColor);

          // Título do Card
          doc.fillColor(options.titleColor)
             .fontSize(14)
             .font('Helvetica-Bold')
             .text(cleanTitle, leftMargin + 16, boxY + topPad, { width: textWidth, align: 'left' });

          // Badge / Número destacado
          if (hasBadge) {
            const badgeY = boxY + topPad;

            // Fundo e borda do Badge
            doc.rect(badgeX, badgeY, badgeW, badgeH)
               .fill(options.accentColor)
               .strokeColor(options.borderColor)
               .lineWidth(1)
               .stroke();

            // Formatação do número e cálculo dinâmico de fonte para couber com folga
            const valStr = String(options.badgeValue).trim();
            let numFontSize = 22;
            if (valStr.length >= 3) {
              numFontSize = 16;
            } else if (valStr.length >= 4) {
              numFontSize = 12;
            }

            // Centralização exata vertical e horizontal dentro da caixa do badge
            doc.fontSize(numFontSize).font('Helvetica-Bold');
            const numH = doc.heightOfString(valStr, { width: badgeW, align: 'center' });
            const numY = badgeY + (badgeH - numH) / 2;

            doc.fillColor('#ffffff')
               .fontSize(numFontSize)
               .font('Helvetica-Bold')
               .text(valStr, badgeX, numY, {
                 width: badgeW,
                 align: 'center'
               });
          }

          // Corpo de texto do Card
          const textY = boxY + topPad + titleH + gap;
          doc.fillColor(textDark)
             .fontSize(11.5)
             .font('Helvetica')
             .text(cleanBody, leftMargin + 16, textY, {
               width: textWidth,
               align: 'justify',
               lineGap: 3.5
             });

          doc.restore();

          layoutTracker.register('card_box', currentPage, leftMargin, boxY, contentWidth, boxH);
          cursorY = boxY + boxH + spaceAfter;
        } else {
          // Para textos muito longos (> 720pt), renderiza título e fluxo contínuo
          doc.fontSize(14).font('Helvetica-Bold');
          const titleMeasuredH = doc.heightOfString(cleanTitle, { width: contentWidth, align: 'left' });

          if (cursorY + titleMeasuredH + 40 > maxY && cursorY > marginTop) {
            doc.addPage();
          }

          let currentPage = doc.bufferedPageRange().count - 1;
          cursorY = layoutTracker.ensureNoOverlap(currentPage, cursorY, 0);

          doc.save();
          doc.fillColor(options.titleColor)
             .fontSize(14)
             .font('Helvetica-Bold')
             .text(cleanTitle, leftMargin, cursorY, { width: contentWidth, align: 'left' });
          doc.restore();

          layoutTracker.register('card_title', currentPage, leftMargin, cursorY, contentWidth, titleMeasuredH);
          cursorY = Math.max(doc.y, cursorY + titleMeasuredH) + 8;

          if (hasBadge) {
            currentPage = doc.bufferedPageRange().count - 1;
            cursorY = layoutTracker.ensureNoOverlap(currentPage, cursorY, 0);

            doc.save();
            doc.rect(leftMargin, cursorY, 180, 28)
               .fill(options.bgColor)
               .strokeColor(options.borderColor)
               .lineWidth(1)
               .stroke();
            doc.fillColor(options.titleColor)
               .fontSize(11)
               .font('Helvetica-Bold')
               .text(`Vibração Mestra: ${options.badgeValue}`, leftMargin + 10, cursorY + 7);
            doc.restore();

            layoutTracker.register('card_badge', currentPage, leftMargin, cursorY, 180, 28);
            cursorY += 36;
          }

          renderParagraph(cleanBody, spaceAfter);
        }
      };

      // HELPER: Renderiza Lista com Marcador (Bullets)
      const renderBulletList = (items: string[], spaceAfter = 14) => {
        items.forEach((item) => {
          const cleanItem = sanitizeText(item);
          if (!cleanItem) return;

          const bulletText = `•  ${cleanItem}`;
          doc.fontSize(11.5).font('Helvetica');
          const itemH = doc.heightOfString(bulletText, {
            width: contentWidth - 15,
            lineGap: 3
          });

          ensureSpace(itemH + 6);

          let currentPage = doc.bufferedPageRange().count - 1;
          cursorY = layoutTracker.ensureNoOverlap(currentPage, cursorY, 0);
          const startY = cursorY;

          doc.save();
          doc.fillColor(textDark)
             .fontSize(11.5)
             .font('Helvetica')
             .text(bulletText, leftMargin + 10, cursorY, {
               width: contentWidth - 15,
               align: 'justify',
               lineGap: 3
             });
          doc.restore();

          currentPage = doc.bufferedPageRange().count - 1;
          const endY = Math.max(doc.y, startY + itemH);
          layoutTracker.register('bullet_item', currentPage, leftMargin + 10, startY, contentWidth - 15, endY - startY);

          cursorY = endY + 6;
        });

        cursorY += spaceAfter - 6;
      };

      // =========================================================================
      // PÁGINA 1: CAPA ELEGANTE E MÍSTICA (Fundo Escuro)
      // =========================================================================
      doc.rect(0, 0, doc.page.width, doc.page.height).fill(coverBg);

      // Molduras
      doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
         .strokeColor(goldAccent)
         .lineWidth(1.5)
         .stroke();

      doc.rect(26, 26, doc.page.width - 52, doc.page.height - 52)
         .strokeColor(purplePrimary)
         .lineWidth(0.5)
         .stroke();

      // Símbolo Místico Superior
      const centerX = doc.page.width / 2;
      doc.save();
      doc.strokeColor(goldBright).lineWidth(1.2);
      doc.circle(centerX, 130, 34).stroke();
      doc.circle(centerX, 130, 24).stroke();
      doc.circle(centerX, 130, 14).stroke();
      doc.restore();

      const fullNameClean = sanitizeText(mapData.engineData.inputs.fullName);
      const birthDateClean = formatDateBR(sanitizeText(mapData.engineData.inputs.birthDate));

      doc.fillColor(goldBright)
         .fontSize(12)
         .font('Helvetica-Bold')
         .text('ESTUDO NUMEROLÓGICO INDIVIDUAL', 0, 185, { align: 'center' });

      doc.fillColor(textLight)
         .fontSize(28)
         .font('Helvetica-Bold')
         .text('MAPA CABALÍSTICO', 0, 220, { align: 'center' });

      doc.fillColor(purplePrimary)
         .fontSize(20)
         .font('Helvetica-Bold')
         .text('PERSONALIZADO', 0, 258, { align: 'center' });

      doc.moveTo(140, 295).lineTo(doc.page.width - 140, 295).strokeColor(goldAccent).lineWidth(1).stroke();

      // Dados do Consultado
      doc.fillColor(goldBright).fontSize(10).font('Helvetica-Bold').text('PREPARADO EXCLUSIVAMENTE PARA:', 0, 350, { align: 'center' });
      doc.fillColor(textLight).fontSize(22).font('Helvetica-Bold').text(fullNameClean, 0, 375, { align: 'center' });

      doc.fillColor(goldBright).fontSize(10).font('Helvetica-Bold').text('DATA DE NASCIMENTO:', 0, 435, { align: 'center' });
      doc.fillColor(textLight).fontSize(16).font('Helvetica').text(birthDateClean, 0, 455, { align: 'center' });

      // Caixa de Identificação do Documento
      doc.rect(110, 670, doc.page.width - 220, 65).fill(coverBox).strokeColor(purplePrimary).lineWidth(1).stroke();
      doc.fillColor(goldBright).fontSize(9).font('Helvetica-Bold').text(`CÓDIGO DE REGISTRO: ${mapData.id}`, 0, 686, { align: 'center' });
      doc.fillColor(textLight).fontSize(9).font('Helvetica').text(`DATA DE EMISSÃO: ${new Date(mapData.createdAt).toLocaleDateString('pt-BR')}`, 0, 706, { align: 'center' });

      // =========================================================================
      // PÁGINA 2 EM DIANTE: CONTEÚDO EDITORIAL FLUIDO E INTEGRAL
      // =========================================================================
      doc.addPage(); // Adiciona a primeira página interna (dispara o listener on('pageAdded'))

      // CAPÍTULO 1: CARTA DE ABERTURA & METODOLOGIA
      renderSectionTitle('1. CARTA DE ABERTURA & METODOLOGIA', 'Apresentação do seu estudo numerológico personalizado');

      const intro = mapData.interpretation.introducao;
      renderParagraph(intro.cartaAbertura, 16);

      renderCardBox({
        title: 'O Que é Este Mapa Cabalístico?',
        bodyText: intro.oQueE,
        bgColor: boxLightBg,
        borderColor: purpleBorder,
        accentColor: purpleTitle,
        titleColor: purpleTitle,
        spaceAfter: 16
      });

      renderCardBox({
        title: 'Como Interpretar Seus Resultados sem Complicação:',
        bodyText: intro.comoInterpretar,
        bgColor: boxGoldBg,
        borderColor: goldBorder,
        accentColor: goldTitle,
        titleColor: goldTitle,
        spaceAfter: 20
      });

      // CAPÍTULO 2: SEUS NÚMEROS PRINCIPAIS (INDICADORES MESTRES)
      renderSectionTitle('2. SEUS NÚMEROS PRINCIPAIS (INDICADORES MESTRES)', 'Os cinco pilares fundamentais explicados passo a passo');

      const mainIndicators = [
        {
          name: 'MOTIVAÇÃO (Vogais do Nome)',
          value: mapData.engineData.indicators.motivacao,
          desc: mapData.interpretation.indicadoresTexto.motivacaoText
        },
        {
          name: 'IMPRESSÃO (Consoantes do Nome)',
          value: mapData.engineData.indicators.impressao,
          desc: mapData.interpretation.indicadoresTexto.impressaoText
        },
        {
          name: 'EXPRESSÃO (Nome Completo)',
          value: mapData.engineData.indicators.expressao,
          desc: mapData.interpretation.indicadoresTexto.expressaoText
        },
        {
          name: 'DESTINO (Data de Nascimento)',
          value: mapData.engineData.indicators.destino,
          desc: mapData.interpretation.indicadoresTexto.destinoText
        },
        {
          name: 'MISSÃO (Expressão + Destino)',
          value: mapData.engineData.indicators.missao,
          desc: mapData.interpretation.indicadoresTexto.missaoText
        }
      ];

      mainIndicators.forEach((ind) => {
        renderCardBox({
          title: ind.name,
          badgeValue: ind.value,
          bodyText: ind.desc,
          bgColor: boxLightBg,
          borderColor: purpleBorder,
          accentColor: purpleTitle,
          titleColor: purpleTitle,
          spaceAfter: 16
        });
      });

      // CAPÍTULO 3: ANÁLISE DETALHADA DO NOME & MATRIZ FREQUENCIAL
      renderSectionTitle('3. ANÁLISE DETALHADA DO NOME & MATRIZ FREQUENCIAL', 'A contagem das frequências de 1 a 9 no seu registro de nascimento');

      // Tabela de Frequências (Matriz 1 a 9)
      const dist = mapData.engineData.nameAnalysis.distribution;
      const matrixTitleText = 'Tabela de Frequências Numéricas Encontradas no Seu Nome:';
      doc.fontSize(13).font('Helvetica-Bold');
      const matrixTitleH = doc.heightOfString(matrixTitleText, { width: contentWidth });

      ensureSpace(matrixTitleH + 8 + 44 + 20);

      let currentPage = doc.bufferedPageRange().count - 1;
      cursorY = layoutTracker.ensureNoOverlap(currentPage, cursorY, 0);

      doc.save();
      doc.fillColor(purpleTitle)
         .fontSize(13)
         .font('Helvetica-Bold')
         .text(matrixTitleText, leftMargin, cursorY, { width: contentWidth });
      doc.restore();

      layoutTracker.register('matrix_title', currentPage, leftMargin, cursorY, contentWidth, matrixTitleH);

      const gridY = cursorY + matrixTitleH + 8;
      let gridX = leftMargin;
      doc.save();
      for (let n = 1; n <= 9; n++) {
        const count = dist.occurrences[n] || 0;
        doc.rect(gridX, gridY, 52, 44).fill(boxGoldBg).strokeColor(goldBorder).lineWidth(1).stroke();
        doc.fillColor(goldTitle).fontSize(12).font('Helvetica-Bold').text(`Nº ${n}`, gridX, gridY + 8, { width: 52, align: 'center' });
        doc.fillColor(textDark).fontSize(12).font('Helvetica').text(`${count}x`, gridX, gridY + 24, { width: 52, align: 'center' });
        gridX += 56;
      }
      doc.restore();

      layoutTracker.register('matrix_grid', currentPage, leftMargin, gridY, 52 * 9 + 5 * 8, 44);

      cursorY = gridY + 44 + 20;
      renderParagraph(mapData.interpretation.nomeEData.distribuicaoText, 18);

      // CAPÍTULO 4: O TRIÂNGULO DA VIDA
      renderSectionTitle('4. O TRIÂNGULO DA VIDA', 'A pirâmide alfabética e a condensação do seu nome');

      const tri = mapData.engineData.nameAnalysis.lifeTriangle;
      renderParagraph(tri.description, 14);

      // Desenho visual da pirâmide de números
      const rows = tri.rows;
      const pyramidH = rows.length * 18 + 12;
      ensureSpace(pyramidH);

      currentPage = doc.bufferedPageRange().count - 1;
      cursorY = layoutTracker.ensureNoOverlap(currentPage, cursorY, 0);
      const pyramidStartY = cursorY;

      let pY = cursorY;
      rows.forEach((row) => {
        const isBase = row.level === rows.length;
        const rowStr = row.numbers.join('   ');
        doc.save();
        doc.fillColor(isBase ? goldTitle : purpleTitle)
           .fontSize(isBase ? 14 : 11)
           .font(isBase ? 'Helvetica-Bold' : 'Helvetica')
           .text(rowStr, 0, pY, { align: 'center' });
        doc.restore();
        pY += 18;
      });

      layoutTracker.register('pyramid', currentPage, leftMargin, pyramidStartY, contentWidth, pY - pyramidStartY);
      cursorY = pY + 12;

      // Caixa Destaque do Vértice
      const vertText = `VÉRTICE DE CONDENSAÇÃO DO NOME: VIBRAÇÃO NÚMERO ${tri.baseVertex}`;
      doc.fontSize(12).font('Helvetica-Bold');
      const vertTextH = doc.heightOfString(vertText, { width: contentWidth - 20, align: 'center' });
      const vertH = Math.max(44, vertTextH + 20);

      ensureSpace(vertH + 18);

      currentPage = doc.bufferedPageRange().count - 1;
      cursorY = layoutTracker.ensureNoOverlap(currentPage, cursorY, 0);
      const vY = cursorY;

      doc.save();
      doc.rect(leftMargin, vY, contentWidth, vertH).fill(boxHighlightBg).strokeColor(purpleBorder).lineWidth(1).stroke();
      doc.fillColor(purpleTitle).fontSize(12).font('Helvetica-Bold').text(vertText, leftMargin + 10, vY + (vertH - vertTextH) / 2, { width: contentWidth - 20, align: 'center' });
      doc.restore();

      layoutTracker.register('vertex_box', currentPage, leftMargin, vY, contentWidth, vertH);

      cursorY = vY + vertH + 18;
      renderParagraph(mapData.interpretation.nomeEData.trianguloText, 18);

      // CAPÍTULO 5: ANÁLISE INTEGRADA DA DATA DE NASCIMENTO
      renderSectionTitle('5. ANÁLISE INTEGRADA DA DATA DE NASCIMENTO', 'O significado do seu Dia, Mês e Ano de nascimento');
      renderParagraph(mapData.interpretation.nomeEData.dataIntegradaText, 18);

      // CAPÍTULO 6: DESAFIOS & CICLOS DE VIDA
      renderSectionTitle('6. DESAFIOS & CICLOS DE VIDA', 'Os aprendizados de maturidade, os grandes períodos e o Ano Pessoal');

      // Subtítulo: Desafios
      const chSubText = 'OS DESAFIOS NUMEROLÓGICOS:';
      doc.fontSize(13).font('Helvetica-Bold');
      const chSubH = doc.heightOfString(chSubText, { width: contentWidth });
      ensureSpace(chSubH + 40);

      currentPage = doc.bufferedPageRange().count - 1;
      cursorY = layoutTracker.ensureNoOverlap(currentPage, cursorY, 0);

      doc.save();
      doc.fillColor(purpleTitle).fontSize(13).font('Helvetica-Bold').text(chSubText, leftMargin, cursorY, { width: contentWidth });
      doc.restore();

      layoutTracker.register('ch_sub', currentPage, leftMargin, cursorY, contentWidth, chSubH);
      cursorY = Math.max(doc.y, cursorY + chSubH) + 12;

      mapData.engineData.dateAnalysis.challenges.forEach((ch) => {
        renderCardBox({
          title: `${ch.challengeType}: Número ${ch.value}`,
          bodyText: `${ch.meaning}\n\nAprendizado principal: ${ch.learnings.join(', ')}.`,
          bgColor: boxLightBg,
          borderColor: purpleBorder,
          accentColor: goldTitle,
          titleColor: goldTitle,
          spaceAfter: 14
        });
      });

      // Subtítulo: Ciclos
      const cycSubText = 'OS TRÊS CICLOS EVOLUTIVOS DE VIDA:';
      doc.fontSize(13).font('Helvetica-Bold');
      const cycSubH = doc.heightOfString(cycSubText, { width: contentWidth });
      ensureSpace(cycSubH + 40);

      currentPage = doc.bufferedPageRange().count - 1;
      cursorY = layoutTracker.ensureNoOverlap(currentPage, cursorY, 0);

      doc.save();
      doc.fillColor(purpleTitle).fontSize(13).font('Helvetica-Bold').text(cycSubText, leftMargin, cursorY, { width: contentWidth });
      doc.restore();

      layoutTracker.register('cyc_sub', currentPage, leftMargin, cursorY, contentWidth, cycSubH);
      cursorY = Math.max(doc.y, cursorY + cycSubH) + 12;

      mapData.engineData.dateAnalysis.cycles.forEach((cyc) => {
        renderCardBox({
          title: `${cyc.period} (${cyc.ageRange}) — Número ${cyc.value}`,
          bodyText: cyc.symbolicInterpretation,
          bgColor: boxGoldBg,
          borderColor: goldBorder,
          accentColor: purpleTitle,
          titleColor: purpleTitle,
          spaceAfter: 14
        });
      });

      // Ano Pessoal
      const py = mapData.engineData.dateAnalysis.personalYear;
      renderCardBox({
        title: `ANO PESSOAL ATUAL (${py.currentYear}): NÚMERO ${py.yearNumber} — ${py.theme}`,
        bodyText: mapData.interpretation.desafiosECiclos.anoPessoalTexto,
        bgColor: boxHighlightBg,
        borderColor: purpleBorder,
        accentColor: purpleTitle,
        titleColor: purpleTitle,
        spaceAfter: 20
      });

      // CAPÍTULO 7: ÁREAS DA VIDA
      renderSectionTitle('7. ANÁLISE DETALHADA POR ÁREAS DA VIDA', 'Como seus números atuam em cada pilar do seu cotidiano');

      mapData.interpretation.lifeAreas.forEach((area) => {
        renderCardBox({
          title: `${area.areaName} (Regência Número ${area.associatedNumber})`,
          bodyText: area.text,
          bgColor: boxLightBg,
          borderColor: purpleBorder,
          accentColor: goldTitle,
          titleColor: purpleTitle,
          spaceAfter: 14
        });
      });

      // CAPÍTULO 8: CRUZAMENTO DOS INDICADORES
      renderSectionTitle('8. CRUZAMENTO DOS INDICADORES', 'A sinergia e o diálogo entre seus números principais');

      mapData.interpretation.crossings.forEach((cross) => {
        renderCardBox({
          title: `${cross.title} (Vibrações ${cross.numbersCombined})`,
          bodyText: cross.text,
          bgColor: boxGoldBg,
          borderColor: goldBorder,
          accentColor: purpleTitle,
          titleColor: goldTitle,
          spaceAfter: 16
        });
      });

      // CAPÍTULO 9: SÍNTESE FINAL & REFLEXÕES DE ENCERRAMENTO
      renderSectionTitle('9. SÍNTESE FINAL & REFLEXÕES DE ENCERRAMENTO', 'Conclusão integrada da sua arquitetura numerológica');

      const synth = mapData.interpretation.sinteseFinal;
      renderParagraph(synth.leituraIntegrada, 16);

      // Principais Potenciais Destacados
      const potSubText = 'Principais Potenciais Destacados:';
      doc.fontSize(13).font('Helvetica-Bold');
      const potSubH = doc.heightOfString(potSubText, { width: contentWidth });
      ensureSpace(potSubH + 30);

      currentPage = doc.bufferedPageRange().count - 1;
      cursorY = layoutTracker.ensureNoOverlap(currentPage, cursorY, 0);

      doc.save();
      doc.fillColor(purpleTitle).fontSize(13).font('Helvetica-Bold').text(potSubText, leftMargin, cursorY, { width: contentWidth });
      doc.restore();

      layoutTracker.register('pot_sub', currentPage, leftMargin, cursorY, contentWidth, potSubH);
      cursorY = Math.max(doc.y, cursorY + potSubH) + 12;

      renderBulletList(synth.potenciaisDestacados, 16);

      // Pontos de Atenção para o Desenvolvimento
      const attSubText = 'Pontos de Atenção para o Seu Desenvolvimento:';
      doc.fontSize(13).font('Helvetica-Bold');
      const attSubH = doc.heightOfString(attSubText, { width: contentWidth });
      ensureSpace(attSubH + 30);

      currentPage = doc.bufferedPageRange().count - 1;
      cursorY = layoutTracker.ensureNoOverlap(currentPage, cursorY, 0);

      doc.save();
      doc.fillColor(goldTitle).fontSize(13).font('Helvetica-Bold').text(attSubText, leftMargin, cursorY, { width: contentWidth });
      doc.restore();

      layoutTracker.register('att_sub', currentPage, leftMargin, cursorY, contentWidth, attSubH);
      cursorY = Math.max(doc.y, cursorY + attSubH) + 12;

      renderBulletList(synth.desafiosPrincipais, 18);

      // Mensagem de Encerramento em Caixa Destaque
      renderCardBox({
        title: 'Mensagem de Encerramento:',
        bodyText: `"${synth.reflexoesFinais}"`,
        bgColor: boxHighlightBg,
        borderColor: purpleBorder,
        accentColor: purpleTitle,
        titleColor: purpleTitle,
        spaceAfter: 10
      });

      // Validação final de sobreposições de layout
      layoutTracker.validate(doc.bufferedPageRange().count);

      // =========================================================================
      // NUMERAÇÃO DE PÁGINAS E RODAPÉ (PÁGINA X DE Y)
      // =========================================================================
      const totalPages = doc.bufferedPageRange().count;

      // Desativa estritamente a quebra automática de página para desenhar cabeçalhos e rodapés sobrepostos sem criar páginas extras
      doc.options.autoPageBreak = false;
      doc.page.margins.bottom = 0;
      doc.page.margins.top = 0;

      for (let i = 0; i < totalPages; i++) {
        doc.switchToPage(i);
        doc.page.margins.bottom = 0;
        doc.page.margins.top = 0;
        doc.options.autoPageBreak = false;
        doc.y = 24;

        // Aplica cabeçalho e rodapé em todas as páginas internas (página > 0)
        if (i > 0) {
          doc.save();

          // Cabeçalho discreto
          doc.fillColor(textMutedDark)
             .fontSize(8.5)
             .font('Helvetica')
             .text('MAPA CABALÍSTICO PERSONALIZADO — ESTUDO EXCLUSIVO', leftMargin, 24, { width: 320, align: 'left', lineBreak: false });
          doc.moveTo(leftMargin, 36).lineTo(550, 36).strokeColor('#cbd5e1').lineWidth(0.5).stroke();

          // Rodapé discreto
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

      // Garante que a última página está ativa e com Y seguro para evitar acionamento de quebra no doc.end()
      doc.switchToPage(totalPages - 1);
      doc.y = 24;

      // Finaliza a gravação do PDF
      doc.end();

      writeStream.on('finish', () => {
        resolve(filePath);
      });

      writeStream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
}
