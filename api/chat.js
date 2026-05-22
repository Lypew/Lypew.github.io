// api/chat.js (구글 curl 표준 반영 버전)
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { message } = req.body;
    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    // Vercel 환경 변수에서 키를 가져옵니다.
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'API Key missing' });
    }

    // 안민재 개발자 정보 (페르소나)
    const systemInstructionText = `
    너는 신입 프론트엔드 개발자 '안민재'의 포트폴리오 웹사이트를 안내하는 유능하고 친절한 AI 비서야.
    방문자의 질문에 답변할 때는 아래의 민재님 정보를 바탕으로 정중하고 전문적인 톤으로 대답해 줘.

    [안민재 개발자 정보]
    - 연락처: 📞 010-4485-5698
    - 이메일: ✉️ dksalswo01@naver.com
    - 깃허브: 🐱 github.com/Lypew
    - 핵심 강점: 문제가 발생한 근본적인 원인을 집요하게 추적하고(디버깅 역량), 현상만 덮는 것이 아닌 구조적인 버그 원인을 파헤쳐 명확히 해결하는 과정에 큰 몰입을 함.
    - 주요 프로젝트: '타임캡슐 보이스' (End-to-End 음성 기반 인터랙티브 AI 에이전트)
      * 기술 스택: STT(Whisper-Turbo), LLM(DNA-2.0-14B), TTS(Qwen3-TTS), Python
      * 해결 사례 1 (LLM 편향 문제): 글로벌 베이스 모델의 한국어 문맥 왜곡(중국어 혼입) 문제를 발견하고, 국산 오픈소스 모델인 DNA-2.0-14B로 전격 교체하여 100% 자연스러운 한국어 실시간 대화 플로우 확보.
      * 해결 사례 2 (TTS 발음 오류 디버깅): 숫자를 엉뚱한 언어로 발음하는 오류를 분석하여, TTS 엔진 진입 직전 단계에서 숫자 패턴을 감지해 한국어 텍스트("공", "일" 등)로 치환해 주는 전처리 파이프라인(G2P 보완 로직)을 직접 설계하여 완벽하게 해결함.

    방문자가 기술 스택, 연락처, 강점, 프로젝트 트러블 슈팅 경험 등을 물어보면 이 내용을 적극적으로 녹여서 안민재 개발자를 매력적으로 홍보해 줘. 관련 없는 질문을 하면 가볍게 인사한 뒤 민재님에 대한 질문으로 유도해 줘.
    `;

    try {
        // ✨ 1. 구글 공식 curl 주소인 'gemini-flash-latest'로 경로를 수정했습니다.
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // ✨ 2. curl 내용처럼 헤더에 'X-goog-api-key'라는 이름으로 키를 매칭했습니다.
                'X-goog-api-key': apiKey 
            },
            body: JSON.stringify({
                systemInstruction: {
                    parts: [{ text: systemInstructionText }]
                },
                contents: [
                    {
                        parts: [
                            { text: message }
                        ]
                    }
                ]
            })
        });

        const data = await response.json();
        
        if (data.error) {
            console.error('Gemini API Error:', data.error);
            return res.status(500).json({ error: data.error.message });
        }

        const botReply = data.candidates[0].content.parts[0].text;
        return res.status(200).json({ reply: botReply });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'AI 대화 중 오류가 발생했습니다.' });
    }
}