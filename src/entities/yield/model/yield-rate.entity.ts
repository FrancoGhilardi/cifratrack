export class YieldRate {
  constructor(
    public readonly id: string,
    public readonly providerId: string,
    public readonly providerName: string,
    public readonly currency: string,
    public readonly rate: number, // TNA
    public readonly date: Date,
  ) {
    if (this.rate < 0) {
      throw new Error("Yield rate cannot be negative");
    }
  }
}
