import { NextResponse, type NextRequest } from 'next/server'
import { requireUserId } from '@/lib/server/auth'
import { errorResponse, HttpError } from '@/lib/server/http'
import {
  buyListing,
  claimQuest,
  enterTournament,
  forgeCards,
  mintCard,
  recordShare,
  resetPlayer,
  runBattle,
  scanProfile,
  setMainCard,
  syncMainCard,
  upgradeCard,
} from '@/lib/server/game'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const userId = await requireUserId(req)
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>
    const action = String(body.action ?? '')

    switch (action) {
      case 'scan':
        return NextResponse.json(await scanProfile(userId, String(body.handle ?? '')))
      case 'forge':
        return NextResponse.json(await forgeCards(userId, Array.isArray(body.cardIds) ? (body.cardIds as string[]) : []))
      case 'upgrade':
        return NextResponse.json(await upgradeCard(userId, String(body.cardId ?? '')))
      case 'battle':
        return NextResponse.json(await runBattle(userId, String(body.cardId ?? ''), String(body.opponentCardId ?? '')))
      case 'buy':
        return NextResponse.json(await buyListing(userId, String(body.listingId ?? '')))
      case 'tournament':
        return NextResponse.json(await enterTournament(userId, String(body.tournamentId ?? '')))
      case 'mint':
        return NextResponse.json(await mintCard(userId, String(body.cardId ?? '')))
      case 'quest':
        return NextResponse.json(await claimQuest(userId, String(body.questId ?? '')))
      case 'main-card':
        return NextResponse.json(await setMainCard(userId, String(body.cardId ?? '')))
      case 'share':
        return NextResponse.json(await recordShare(userId))
      case 'sync':
        return NextResponse.json(await syncMainCard(userId))
      case 'reset':
        return NextResponse.json(await resetPlayer(userId))
      default:
        throw new HttpError(400, 'Unknown action.')
    }
  } catch (err) {
    return errorResponse(err)
  }
}
