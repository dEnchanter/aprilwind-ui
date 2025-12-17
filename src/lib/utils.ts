import { type ClassValue, clsx } from "clsx"
import { format, parseISO } from "date-fns";
import { twMerge } from "tailwind-merge";
import { toZonedTime } from 'date-fns-tz';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function classNames(...classes: any) {
  return classes.filter(Boolean).join(' ')
}

export const getInitials = (name: string | null | undefined) => {
  if (!name) {
    return '';
  }

  return name
    .split(' ')
    .filter(Boolean) // Filter out any empty strings resulting from multiple spaces
    .slice(0, 2) // Only take the first two names
    .map(n => n[0].toUpperCase()) // Get the first letter of each part and convert to uppercase immediately
    .join(''); // Join them together
};

export const getInitialsFromNames = (firstName: string = '', lastName: string = '') => {
  const firstInitial = firstName ? firstName[0] : '';
  const lastInitial = lastName ? lastName[0] : '';
  return (firstInitial + lastInitial).toUpperCase();
};

export const formatDate = (dateString: string) => {
  if (!dateString) {
    return 'Invalid date';
  }

  try {
    // Handle both ISO string and regular date string formats
    const date = parseISO(dateString);

    // Check if the parsed date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }

    const utcDate = toZonedTime(date, 'UTC'); // Convert the date to UTC
    return format(utcDate, 'MMMM d, yyyy, hh:mm:ss aa'); // Format the date
  } catch (error) {
    console.error('Error parsing date:', error, 'Input:', dateString);
    return 'Invalid date';
  }
};

export function formatCurrency(amount: string | number, currency: string = "₦"): string {
  // Check if the amount is the masked value
  if (amount === "****") {
    return amount; // Return the masked value directly
  }

  // Convert the input to a number if it is a string
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  // Ensure the amount is a valid number
  if (isNaN(numericAmount)) {
    return `${currency}0.00`; // Return a default value if the amount is not a valid number
  }

  const formattedAmount = numericAmount.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${currency}${formattedAmount}`;
}

export function formatNairaCurrency(amount: string | number, currency: string = "₦"): string {
  // Check if the amount is the masked value
  if (amount === "****") {
    return amount; // Return the masked value directly
  }

  // Convert the input to a number if it is a string
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  // Ensure the amount is a valid number
  if (isNaN(numericAmount)) {
    return `${currency}0.00`; // Return a default value if the amount is not a valid number
  }

  // Format for amounts above or equal to 1 billion
  if (numericAmount >= 1000000000) {
    const billions = numericAmount / 1000000000;
    const truncatedBillions = Math.trunc(billions * 100) / 100; // Truncate to two decimal places
    return `${currency}${truncatedBillions.toFixed(2)}B`;
  }

  // Format for amounts above or equal to 1 million
  if (numericAmount >= 1000000) {
    const millions = numericAmount / 1000000;
    const truncatedMillions = Math.trunc(millions * 100) / 100; // Truncate to two decimal places
    return `${currency}${truncatedMillions.toFixed(2)}M`;
  }

  // Format for amounts less than 1 million
  const formattedAmount = numericAmount.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${currency}${formattedAmount}`;
}

export function determineInputType(characterType: string) {
  switch (characterType) {
    case "ALPHANUMERIC":
      return "text";
    case "STRING":
      return "text";
    case "NUMBER":
      return "number";
    case "BOOLEAN":
      return "checkbox";
    default:
      return "text";
  }
}

export function determinePattern(characterType: string) {
  switch (characterType) {
    case "ALPHANUMERIC":
      return "/^[a-zA-Z0-9 ,.'-]*$/";
    case "NUMBER":
      return "\\d*";
    default:
      return undefined; // No pattern for other types
  }
}

export const formatKey = (key: string): string => {
  return key.replace(/\s+/g, '_').toLowerCase();
};

export const parseCurrencyToNumber = (value: string): number => {
  const numberString = value.replace(/[^0-9.-]+/g, ''); // Remove everything except digits and decimal point
  const integerPart = numberString.split('.')[0]; // Get only the integer part before the decimal
  const parsedNumber = parseInt(integerPart, 10);
  return isNaN(parsedNumber) ? 0 : parsedNumber;
};

export const parseCurrencyToNumber2 = (value: string): number => {
  // Remove any non-numeric characters except digits, the decimal point, and negative signs
  const numberString = value.replace(/[^0-9.-]+/g, '');

  // Parse the string into a floating-point number
  const parsedNumber = parseFloat(numberString);

  // If the parsed number is NaN, return 0; otherwise, return the parsed number
  return isNaN(parsedNumber) ? 0 : parsedNumber;
};

export const parsePercentageToNumber = (value: string): number => {
  const numberString = value.replace(/[^0-9.]+/g, ''); // Remove everything except digits and decimal points
  const parsedNumber = parseFloat(numberString);
  return isNaN(parsedNumber) ? 0 : parsedNumber;
};

export const getColorByWalletType = (walletType: string) => {
  switch (walletType) {
    case "TRANSACTIONAL":
      return "#C2DBFF";
    case "SAVINGS":
      return "#D3EED5";
    case "EARNINGS":
      return "#DCE0E5";
    case "CHILD":
      return "#C8C8F9";
    default:
      return "#FFF";
  }
};

export const capitalize = (value: string): string => {
  if (!value) return value; // Return the original value if it's empty
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
};
