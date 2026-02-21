import type { FC } from "react";
import { Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";

type VideoStatusProps = {
  status: string;
  sx?: SxProps<Theme>;
  component?: React.ElementType;
  variant?: React.ComponentProps<typeof Typography>["variant"];
};

const capitalizeFirstLetter = (str: string) => {
  if (!str || typeof str !== "string") return "Unknown";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const VideoStatus: FC<VideoStatusProps> = ({
  status,
  sx,
  component = "span",
  variant = "body2",
}) => {
  return (
    <Typography
      component={component}
      variant={variant}
      color={
        status === "ready"
          ? "success.main"
          : status === "processing"
            ? "info.main"
            : status === "failed"
              ? "error.main"
              : status === "unknown"
                ? "text.primary"
                : "text.secondary"
      }
      sx={sx}
    >
      {capitalizeFirstLetter(status)}
    </Typography>
  );
};

export default VideoStatus;
