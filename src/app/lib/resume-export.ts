import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from "pdf-lib";

import { AlignmentType, Document, Packer, Paragraph, TextRun } from "docx";

import { getResumeSectionLabels } from "./resume-i18n";

import type { ResumeLanguage } from "@/schemas/job";

import type { GeneratedJobPayload } from "@/schemas/job-result";

type Resume = GeneratedJobPayload["enhanced"];

const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;

const PDF_MARGIN_X = 42;
const PDF_MARGIN_Y = 42;

const PDF_BODY_SIZE = 9.5;
const PDF_SMALL_SIZE = 8.5;
const PDF_SECTION_SIZE = 11;
const PDF_TITLE_SIZE = 16;

type PdfContext = {
  document: PDFDocument;
  page: PDFPage;
  regular: PDFFont;
  bold: PDFFont;
  italic: PDFFont;
  y: number;
};

export async function exportResumePdf(
  resume: Resume,
  language: ResumeLanguage,
  fileName?: string,
) {
  const labels = getResumeSectionLabels(language);

  const document = await PDFDocument.create();

  const regular = await document.embedFont(StandardFonts.Helvetica);

  const bold = await document.embedFont(StandardFonts.HelveticaBold);

  const italic = await document.embedFont(StandardFonts.HelveticaOblique);

  const page = document.addPage([A4_WIDTH, A4_HEIGHT]);

  const context: PdfContext = {
    document,
    page,
    regular,
    bold,
    italic,
    y: A4_HEIGHT - PDF_MARGIN_Y,
  };

  drawCenteredText(context, `${resume.basics.name} | ${resume.headline}`, {
    font: bold,
    size: PDF_TITLE_SIZE,
  });

  context.y -= 5;

  const contactLine = [
    resume.basics.location,
    resume.basics.email,
    resume.basics.phone,
    resume.basics.linkedin,
    resume.basics.github,
    resume.basics.portfolio,
  ]
    .filter(Boolean)
    .join(" | ");

  drawWrappedText(context, contactLine, {
    font: regular,
    size: PDF_SMALL_SIZE,
    centered: true,
    lineGap: 2,
  });

  drawSectionHeading(context, labels.summary);

  drawWrappedText(context, resume.summary, {
    font: regular,
    size: PDF_BODY_SIZE,
    lineGap: 2,
  });

  if (resume.education.length > 0) {
    drawSectionHeading(context, labels.education);

    for (const item of resume.education) {
      ensureSpace(context, 38);

      drawWrappedText(context, item.institution, {
        font: bold,
        size: PDF_BODY_SIZE,
        lineGap: 2,
      });

      const details = [
        item.degree,
        item.status ?? formatDateRange(item.startDate, item.endDate),
      ]
        .filter(Boolean)
        .join(" | ");

      drawWrappedText(context, details, {
        font: italic,
        size: PDF_SMALL_SIZE,
        lineGap: 2,
      });

      context.y -= 4;
    }
  }

  if (resume.experiences.length > 0) {
    drawSectionHeading(context, labels.experience);

    for (const experience of resume.experiences) {
      ensureSpace(context, 60);

      drawWrappedText(context, experience.role, {
        font: bold,
        size: PDF_BODY_SIZE,
        lineGap: 2,
      });

      const metadata = [
        experience.company,

        formatDateRange(experience.startDate, experience.endDate),

        experience.location,
      ]
        .filter(Boolean)
        .join(" | ");

      drawWrappedText(context, metadata, {
        font: italic,
        size: PDF_SMALL_SIZE,
        lineGap: 2,
      });

      context.y -= 2;

      for (const bullet of experience.bullets) {
        drawBullet(context, bullet);
      }

      context.y -= 5;
    }
  }

  if (resume.projects.length > 0) {
    drawSectionHeading(context, labels.projects);

    for (const project of resume.projects) {
      ensureSpace(context, 45);

      drawWrappedText(context, `${project.name} | ${project.description}`, {
        font: regular,
        size: PDF_BODY_SIZE,
        lineGap: 2,
      });

      if (project.technologies.length > 0) {
        drawWrappedText(context, project.technologies.join(", "), {
          font: italic,
          size: PDF_SMALL_SIZE,
          lineGap: 2,
        });
      }

      context.y -= 4;
    }
  }

  if (resume.skills.length > 0) {
    drawSectionHeading(context, labels.skills);

    for (const group of resume.skills) {
      drawWrappedText(context, `${group.category}: ${group.items.join(", ")}`, {
        font: regular,
        size: PDF_BODY_SIZE,
        lineGap: 2,
      });
    }
  }

  if (resume.languages.length > 0) {
    drawSectionHeading(context, labels.languages);

    drawWrappedText(
      context,
      resume.languages
        .map(({ language, level }) => `${language}: ${level}`)
        .join(" | "),
      {
        font: regular,
        size: PDF_BODY_SIZE,
        lineGap: 2,
      },
    );
  }

  const bytes = await document.save();

  const pdfBuffer = bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer;

  downloadBlob(
    new Blob([pdfBuffer], {
      type: "application/pdf",
    }),

    fileName ?? buildFileName(resume, "pdf"),
  );
}

export async function exportResumeDocx(
  resume: Resume,
  language: ResumeLanguage,
  fileName?: string,
) {
  const labels = getResumeSectionLabels(language);

  const children: Paragraph[] = [];

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,

      spacing: {
        after: 120,
      },

      children: [
        new TextRun({
          text: `${resume.basics.name} | ${resume.headline}`,

          bold: true,

          size: 30,
        }),
      ],
    }),
  );

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,

      spacing: {
        after: 220,
      },

      children: [
        new TextRun({
          text: [
            resume.basics.location,

            resume.basics.email,

            resume.basics.phone,

            resume.basics.linkedin,

            resume.basics.github,

            resume.basics.portfolio,
          ]
            .filter(Boolean)
            .join(" | "),

          size: 18,
        }),
      ],
    }),
  );

  children.push(sectionTitle(labels.summary));

  children.push(bodyParagraph(resume.summary));

  if (resume.education.length > 0) {
    children.push(sectionTitle(labels.education));

    for (const item of resume.education) {
      children.push(
        new Paragraph({
          spacing: {
            after: 40,
          },

          children: [
            new TextRun({
              text: item.institution,

              bold: true,

              size: 19,
            }),
          ],
        }),
      );

      children.push(
        new Paragraph({
          spacing: {
            after: 100,
          },

          children: [
            new TextRun({
              text: [
                item.degree,

                item.status ?? formatDateRange(item.startDate, item.endDate),
              ]
                .filter(Boolean)
                .join(" | "),

              italics: true,

              size: 18,
            }),
          ],
        }),
      );
    }
  }

  if (resume.experiences.length > 0) {
    children.push(sectionTitle(labels.experience));

    for (const experience of resume.experiences) {
      children.push(
        new Paragraph({
          spacing: {
            after: 30,
          },

          children: [
            new TextRun({
              text: experience.role,

              bold: true,

              size: 19,
            }),
          ],
        }),
      );

      children.push(
        new Paragraph({
          spacing: {
            after: 50,
          },

          children: [
            new TextRun({
              text: [
                experience.company,

                formatDateRange(experience.startDate, experience.endDate),

                experience.location,
              ]
                .filter(Boolean)
                .join(" | "),

              italics: true,

              size: 18,
            }),
          ],
        }),
      );

      for (const bullet of experience.bullets) {
        children.push(
          new Paragraph({
            bullet: {
              level: 0,
            },

            spacing: {
              after: 25,
            },

            children: [
              new TextRun({
                text: bullet,

                size: 18,
              }),
            ],
          }),
        );
      }

      children.push(spacer());
    }
  }

  if (resume.projects.length > 0) {
    children.push(sectionTitle(labels.projects));

    for (const project of resume.projects) {
      children.push(
        new Paragraph({
          spacing: {
            after: 30,
          },

          children: [
            new TextRun({
              text: `${project.name} | `,

              bold: true,

              size: 18,
            }),

            new TextRun({
              text: project.description,

              size: 18,
            }),
          ],
        }),
      );

      if (project.technologies.length > 0) {
        children.push(
          new Paragraph({
            spacing: {
              after: 100,
            },

            children: [
              new TextRun({
                text: project.technologies.join(", "),

                italics: true,

                size: 17,
              }),
            ],
          }),
        );
      }
    }
  }

  if (resume.skills.length > 0) {
    children.push(sectionTitle(labels.skills));

    for (const group of resume.skills) {
      children.push(
        new Paragraph({
          spacing: {
            after: 35,
          },

          children: [
            new TextRun({
              text: `${group.category}: `,

              bold: true,

              size: 18,
            }),

            new TextRun({
              text: group.items.join(", "),

              size: 18,
            }),
          ],
        }),
      );
    }
  }

  if (resume.languages.length > 0) {
    children.push(sectionTitle(labels.languages));

    children.push(
      bodyParagraph(
        resume.languages
          .map(({ language, level }) => `${language}: ${level}`)
          .join(" | "),
      ),
    );
  }

  const document = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,

              right: 900,

              bottom: 720,

              left: 900,
            },
          },
        },

        children,
      },
    ],
  });

  const blob = await Packer.toBlob(document);

  downloadBlob(
    blob,

    fileName ?? buildFileName(resume, "docx"),
  );
}

function drawSectionHeading(context: PdfContext, title: string) {
  ensureSpace(context, 35);

  context.y -= 10;

  context.page.drawText(title, {
    x: PDF_MARGIN_X,

    y: context.y,

    size: PDF_SECTION_SIZE,

    font: context.bold,

    color: rgb(0, 0, 0),
  });

  context.y -= 4;

  context.page.drawLine({
    start: {
      x: PDF_MARGIN_X,
      y: context.y,
    },

    end: {
      x: A4_WIDTH - PDF_MARGIN_X,

      y: context.y,
    },

    thickness: 0.7,

    color: rgb(0.15, 0.15, 0.15),
  });

  context.y -= 12;
}

function drawCenteredText(
  context: PdfContext,
  text: string,
  options: {
    font: PDFFont;
    size: number;
  },
) {
  ensureSpace(context, options.size + 5);

  const width = options.font.widthOfTextAtSize(text, options.size);

  const maxWidth = A4_WIDTH - PDF_MARGIN_X * 2;

  if (width <= maxWidth) {
    context.page.drawText(text, {
      x: (A4_WIDTH - width) / 2,

      y: context.y,

      size: options.size,

      font: options.font,
    });

    context.y -= options.size + 3;

    return;
  }

  drawWrappedText(context, text, {
    font: options.font,

    size: options.size,

    centered: true,

    lineGap: 2,
  });
}

function drawWrappedText(
  context: PdfContext,
  text: string,
  options: {
    font: PDFFont;
    size: number;
    indent?: number;
    centered?: boolean;
    lineGap?: number;
  },
) {
  const indent = options.indent ?? 0;

  const availableWidth = A4_WIDTH - PDF_MARGIN_X * 2 - indent;

  const lines = wrapText(text, options.font, options.size, availableWidth);

  const lineHeight = options.size + (options.lineGap ?? 2);

  for (const line of lines) {
    ensureSpace(context, lineHeight);

    const lineWidth = options.font.widthOfTextAtSize(line, options.size);

    const x = options.centered
      ? Math.max(
        PDF_MARGIN_X,

        (A4_WIDTH - lineWidth) / 2,
      )
      : PDF_MARGIN_X + indent;

    context.page.drawText(line, {
      x,
      y: context.y,
      size: options.size,
      font: options.font,

      color: rgb(0, 0, 0),
    });

    context.y -= lineHeight;
  }
}

function drawBullet(context: PdfContext, text: string) {
  const bulletIndent = 12;

  ensureSpace(context, PDF_BODY_SIZE + 5);

  context.page.drawText("•", {
    x: PDF_MARGIN_X + 2,

    y: context.y,

    size: PDF_BODY_SIZE,

    font: context.regular,
  });

  drawWrappedText(context, text, {
    font: context.regular,

    size: PDF_BODY_SIZE,

    indent: bulletIndent,

    lineGap: 2,
  });
}

function ensureSpace(context: PdfContext, requiredHeight: number) {
  if (context.y - requiredHeight >= PDF_MARGIN_Y) {
    return;
  }

  const page = context.document.addPage([A4_WIDTH, A4_HEIGHT]);

  context.page = page;

  context.y = A4_HEIGHT - PDF_MARGIN_Y;
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number) {
  const paragraphs = text.split("\n");

  const lines: string[] = [];

  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) {
      lines.push("");

      continue;
    }

    const words = paragraph.split(/\s+/);

    let line = "";

    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;

      const width = font.widthOfTextAtSize(candidate, size);

      if (width <= maxWidth) {
        line = candidate;

        continue;
      }

      if (line) {
        lines.push(line);
      }

      line = word;
    }

    if (line) {
      lines.push(line);
    }
  }

  return lines;
}

function sectionTitle(text: string) {
  return new Paragraph({
    spacing: {
      before: 180,
      after: 70,
    },

    children: [
      new TextRun({
        text,
        bold: true,
        size: 21,
      }),
    ],
  });
}

function bodyParagraph(text: string) {
  return new Paragraph({
    spacing: {
      after: 80,
    },

    children: [
      new TextRun({
        text,
        size: 18,
      }),
    ],
  });
}

function spacer() {
  return new Paragraph({
    spacing: {
      after: 70,
    },

    children: [],
  });
}

function formatDateRange(
  startDate: string | null,

  endDate: string | null,
) {
  if (!startDate && !endDate) {
    return "";
  }

  if (!startDate) {
    return endDate ?? "";
  }

  if (!endDate) {
    return startDate;
  }

  return `${startDate}-${endDate}`;
}

function buildFileName(resume: Resume, extension: "pdf" | "docx") {
  const name = resume.basics.name
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^|-$/g, "")
    .toLowerCase();

  return `${name || "resume"}-tailored.${extension}`;
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");

  anchor.href = url;

  anchor.download = fileName;

  document.body.appendChild(anchor);

  anchor.click();

  anchor.remove();

  URL.revokeObjectURL(url);
}
