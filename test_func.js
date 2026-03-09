async function test() {
    console.log("Testing analyze-decision with Raw Fetch...")
    try {
        const response = await fetch(`${process.env.VITE_SUPABASE_URL}/functions/v1/analyze-decision`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({
                title: "Test Decision",
                category: "Career",
                what_decided: "I took the job",
                reasoning: "More money",
                alternatives_rejected: "Staying put",
                expected_outcome: "Happiness"
            })
        })
        const text = await response.text()
        console.log("Status:", response.status)
        console.log("Body:", text)
    } catch (e) {
        console.error("Caught Exception:", e)
    }
}

test()
