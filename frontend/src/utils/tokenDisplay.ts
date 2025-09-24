export const shortenAddress = (value: string, visible = 4) => {
  if (!value || value.length <= visible * 2) {
    return value;
  }

  return `${value.slice(0, visible)}…${value.slice(-visible)}`;
};

const addThousandsSeparator = (value: string) => {
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const formatTokenAmount = (
  amount: string | undefined,
  decimals: number
): string => {
  if (!amount) {
    return "0";
  }

  try {
    const raw = BigInt(amount);
    const divisor = BigInt(10) ** BigInt(decimals);
    const whole = raw / divisor;
    const fraction = raw % divisor;
    const wholeString = addThousandsSeparator(whole.toString());

    if (decimals === 0 || fraction === 0n) {
      return wholeString;
    }

    const fractionString = fraction
      .toString()
      .padStart(decimals, "0")
      .replace(/0+$/, "");

    return fractionString ? `${wholeString}.${fractionString}` : wholeString;
  } catch (err) {
    console.warn("[tokenDisplay] Unable to format token amount", err);
    return amount;
  }
};

export const formatRelativeTime = (timestamp: string): string => {
  const parsed = new Date(timestamp);
  if (Number.isNaN(parsed.getTime())) {
    return "just now";
  }

  const diffMs = Date.now() - parsed.getTime();
  if (diffMs < 0) {
    return "moments ago";
  }

  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) {
    return `${seconds}s ago`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days}d ago`;
  }

  const weeks = Math.floor(days / 7);
  if (weeks < 4) {
    return `${weeks}w ago`;
  }

  const months = Math.floor(days / 30);
  if (months < 12) {
    return `${months}mo ago`;
  }

  const years = Math.floor(days / 365);
  return `${years}y ago`;
};
