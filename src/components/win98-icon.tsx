type IconName =
  | "back"
  | "document"
  | "analysis"
  | "resume"
  | "sparkle"
  | "edit"
  | "pdf"
  | "docx"
  | "external"
  | "save"
  | "close"
  | "chevron"
  | "app";

type Props = {
  name: IconName;
  size?: number;
  className?: string;
};

export function Win98Icon({ name, size = 16, className }: Props) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 16 16",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    "aria-hidden": true,
    shapeRendering: "crispEdges" as const,
  };

  switch (name) {
    case "back":
      return (
        <svg {...common}>
          <path fill="#000" d="M1 7h10v2H1z" />
          <path fill="#000" d="M1 7 6 2v3h7v6H6v3z" />
          <path fill="#fff" d="M3 7 6 4v2h6v1z" />
        </svg>
      );

    case "document":
      return (
        <svg {...common}>
          <path fill="#000" d="M2 1h8l4 4v10H2z" />
          <path fill="#fff" d="M3 2h6v4h4v8H3z" />
          <path fill="#c0c0c0" d="M10 2v3h3z" />
          <path fill="#000080" d="M5 8h6v1H5zm0 2h6v1H5zm0 2h4v1H5z" />
        </svg>
      );

    case "analysis":
      return (
        <svg {...common}>
          <path fill="#fff" d="M1 1h14v14H1z" />
          <path fill="#808080" d="M1 1h14v1H2v13H1z" />
          <path fill="#000" d="M3 11h2v2H3zm4-4h2v6H7zm4-3h2v9h-2z" />
          <path fill="#008080" d="M3 10h2v1H3zm4-4h2v1H7zm4-3h2v1h-2z" />
        </svg>
      );

    case "resume":
      return (
        <svg {...common}>
          <path fill="#000" d="M2 1h11v14H2z" />
          <path fill="#fff" d="M3 2h9v12H3z" />
          <path fill="#000080" d="M4 3h7v2H4z" />
          <path fill="#808080" d="M4 7h7v1H4zm0 2h7v1H4zm0 2h5v1H4z" />
        </svg>
      );

    case "sparkle":
      return (
        <svg {...common}>
          <path
            fill="#ffff00"
            d="M8 0h1v5h-1zm0 11h1v5h-1zM0 8h5v1H0zm11 0h5v1h-5z"
          />
          <path
            fill="#fff"
            d="m4 3 1-1 3 3-1 1zm6 7 1-1 3 3-1 1zm1-5 3-3 1 1-3 3zm-7 7 3-3 1 1-3 3z"
          />
          <path fill="#000" d="M7 6h3v4H7z" />
          <path fill="#ffff00" d="M8 5h1v6H8zM6 8h5v1H6z" />
        </svg>
      );

    case "edit":
      return (
        <svg {...common}>
          <path fill="#000" d="m2 11 9-9 3 3-9 9H2z" />
          <path fill="#ffff00" d="m4 10 7-7 2 2-7 7z" />
          <path fill="#fff" d="m3 12 1-2 2 2-2 1z" />
        </svg>
      );

    case "pdf":
      return (
        <svg {...common}>
          <path fill="#000" d="M2 1h9l3 3v11H2z" />
          <path fill="#fff" d="M3 2h7v3h3v9H3z" />
          <path fill="#c00000" d="M4 8h8v4H4z" />
          <path fill="#fff" d="M5 9h1v2H5zm2 0h2v1H8v1H7zm3 0h2v1h-1v1h-1z" />
        </svg>
      );

    case "docx":
      return (
        <svg {...common}>
          <path fill="#000" d="M2 1h9l3 3v11H2z" />
          <path fill="#fff" d="M3 2h7v3h3v9H3z" />
          <path fill="#000080" d="M4 8h8v4H4z" />
          <path fill="#fff" d="m5 9 1 2 1-2 1 2 1-2h1l-1 2H8l-1-1-1 1H5L4 9z" />
        </svg>
      );

    case "external":
      return (
        <svg {...common}>
          <path fill="#000" d="M2 4h7v2H4v6h6V8h2v6H2z" />
          <path fill="#000080" d="M8 1h7v7h-2V4l-6 6-1-1 6-6H8z" />
        </svg>
      );

    case "save":
      return (
        <svg {...common}>
          <path fill="#000" d="M1 1h13v14H1z" />
          <path fill="#000080" d="M2 2h11v12H2z" />
          <path fill="#fff" d="M4 2h7v5H4z" />
          <path fill="#c0c0c0" d="M4 9h7v5H4z" />
          <path fill="#000" d="M5 10h5v3H5z" />
        </svg>
      );

    case "close":
      return (
        <svg {...common}>
          <path
            fill="#000"
            d="M3 3h2v2H3zm8 0h2v2h-2zM5 5h2v2H5zm4 0h2v2H9zM7 7h2v2H7zM5 9h2v2H5zm4 0h2v2H9zm-6 2h2v2H3zm8 0h2v2h-2z"
          />
        </svg>
      );

    case "chevron":
      return (
        <svg {...common}>
          <path fill="#000" d="M3 5h10v2H3zM5 7h6v2H5zm2 2h2v2H7z" />
        </svg>
      );

    case "app":
      return (
        <svg {...common}>
          <path fill="#000" d="M1 1h14v14H1z" />
          <path fill="#000080" d="M2 2h12v12H2z" />
          <path fill="#fff" d="M4 4h8v2H4zm0 4h5v1H4zm0 2h7v1H4z" />
          <path fill="#00ffff" d="M10 8h2v4h-2z" />
        </svg>
      );
  }
}
