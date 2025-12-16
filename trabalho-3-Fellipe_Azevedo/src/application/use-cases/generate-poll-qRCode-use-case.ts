import QRCode from "qrcode";
import { IPollRepository } from "../../domain/repositories/poll-repository";

export type GeneratePollQRCodeInput = {
  pollId: string;
  baseUrl?: string;
};

export class GeneratePollQRCodeUseCase {
  constructor(private readonly pollRepository: IPollRepository) {}

  async execute(input: GeneratePollQRCodeInput): Promise<string> {
    const poll = await this.pollRepository.findById(input.pollId);

    if (!poll) {
      throw new Error("Poll not found");
    }

    const baseUrl = input.baseUrl || "http://localhost:3333";
    const pollUrl = `${baseUrl}/polls/${input.pollId}`;

    try {
      const qrCodeDataURL = await QRCode.toDataURL(pollUrl, {
        errorCorrectionLevel: "M",
        type: "image/png",
        margin: 1,
        width: 300,
      });

      return qrCodeDataURL;
    } catch (error) {
      throw new Error("Failed to generate QR Code");
    }
  }
}
