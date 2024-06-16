const labels = [];
for (let i = 0; i < poll.candidates.length; ++i) {
    labels.push(`${i + 1}. ${poll.candidates[i].title}`);
}

const colours = [
    "rgb(0, 0, 0)",
    "rgb(255, 0, 0)",
    "rgb(0, 255, 0)",
    "rgb(0, 0, 255)",
    "rgb(255, 255, 0)",
    "rgb(0, 255, 255)",
    "rgb(255, 0, 255)",
    "rgb(192, 192, 192)",
    "rgb(128, 128, 128)",
    "rgb(128, 0, 0)",
    "rgb(128, 128, 0)",
    "rgb(0, 128, 0)",
    "rgb(128, 0, 128)",
    "rgb(0, 128, 128)",
    "rgb(0, 0, 128)"
];

function shuffle(array) {
    let currentIndex = array.length;

    while (currentIndex != 0) {
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
}

shuffle(colours);

const backgroundColor = [];
let x = 0;
for (let i = 0; i < poll.candidates.length; ++i) {
    backgroundColor.push(colours[x % colours.length]);
    ++x;
}

const votes = [];
for (let i = 0; i < poll.candidates.length; ++i) {
    votes.push(0);
}

for (let vote of poll.votes) {
    for (let i = 0; i < poll.candidates.length; ++i) {
        if (vote.candidate === poll.candidates[i]._id) {
            ++(votes[i]);
            break;
        }
    }
}

const data = {
    labels,
    datasets: [{
        data: votes,
        backgroundColor,
        hoverOffset: 4
    }]
};

const config = {
    type: "doughnut",
    data
};

const ctx = document.getElementById("results-chart");

if (ctx) {
    new Chart(ctx, config);
}
