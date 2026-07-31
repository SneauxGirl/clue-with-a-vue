export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

export interface IPAnalysisResult {
  ip: string
  fraudScore: number
  riskLevel: RiskLevel
  isVPN: boolean
  isProxy: boolean
  isTor: boolean
  country: string
  abuseReportCount: number
  lastAbuseReportDate: string | null
  isInDatacenter: boolean
  asn: string
  organization: string
}

export class InvalidIPError extends Error {
  constructor(public readonly input: string) {
    super(`Invalid IP address. Format: 192.168.1.1`)
    this.name = 'InvalidIPError'
  }
}

export class IPAnalysisFetchError extends Error {
  constructor(public readonly ip: string) {
    super('Failed to fetch IP analysis.')
    this.name = 'IPAnalysisFetchError'
  }
}
