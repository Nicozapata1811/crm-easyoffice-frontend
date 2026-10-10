/**
 * The global Klap Checkout Flex script defines. Klap does not publish types;
 * these are the options its sandbox script reads.
 */

interface KlapFlexResultado {
  status: string;
  data?: unknown;
}

interface KlapFlexOpciones {
  orderId: string;
  useModal?: boolean;
  useRedirect?: boolean;
  callbackFunction?: (resultado: KlapFlexResultado) => void;
  closeModalFunction?: () => void;
}

interface Window {
  KLAP_FLEX?: { init: (opciones: KlapFlexOpciones) => void };
}
