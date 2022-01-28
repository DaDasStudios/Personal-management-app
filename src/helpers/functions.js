module.exports = {
    roundToTwo: num => {
        var m = Number((Math.abs(num) * 100).toPrecision(15));
        return Math.round(m) / 100 * Math.sign(num);
    },
    toCapitalize: string => {
        return string.charAt(0).toUpperCase() + string.slice(1)
    },
    sortScores(scores) {
        let aux = null
        for (let i = 0; i < scores.length; i++) {
            for (let j = 0; j < scores.length; j++) {
                if (scores[j].score < scores[i].score) {
                    aux = scores[i]
                    scores[i] = scores[j]
                    scores[j] = aux
                }

            }
        }
        return scores
    }
}