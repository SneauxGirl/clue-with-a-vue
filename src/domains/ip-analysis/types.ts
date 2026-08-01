export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

export interface IPAnalysisResult {
  ip: string
  fraudScore: number
  riskLevel: RiskLevel
  isVPN: boolean
  isProxy: boolean
  isTor: boolean
  country: string
  /** GeoIP city; null when the provider only has country-level resolution. */
  city: string | null
  abuseReportCount: number
  lastAbuseReportDate: string | null
  isInDatacenter: boolean
  asn: string
  organization: string
}

export class IPAnalysisFetchError extends Error {
  readonly ip: string

  constructor(ip: string) {
    super('Failed to fetch. Retry?')
    this.name = 'IPAnalysisFetchError'
    this.ip = ip
  }
}
