for (let i = 0; i < number_of_candidates; ++i) {
    document.getElementById(`candidates-${i}`).addEventListener("click", () => {
        const alert_for_empty_vote =
            document.getElementById("alert-for-empty-vote");

        if (alert_for_empty_vote) {
            alert_for_empty_vote.remove();
        }
    });
}

const submit_vote_button = document.getElementById("submit-vote");

submit_vote_button.addEventListener("click", () => {
    let vote_is_empty = true;

    for (let j = 0; j < number_of_candidates; ++j) {
        if (document.getElementById(`candidates-${j}`).checked) {
            vote_is_empty = false;
            break;
        }
    }

    if (vote_is_empty) {
        if (!(document.getElementById("alert-for-empty-vote"))) {
            const div = document.createElement("div");
            div.setAttribute("class", "alert alert-danger alert-dismissible " +
                "fade show");
            div.setAttribute("id", "alert-for-empty-vote");
            div.setAttribute("role", "alert");
            submit_vote_button.parentNode.insertBefore(div, submit_vote_button);

            div.appendChild(document.createTextNode("You cannot submit an " +
                "empty vote!"));
            const button = document.createElement("button");
            button.setAttribute("type", "button");
            button.setAttribute("class", "btn-close");
            button.setAttribute("data-bs-dismiss", "alert");
            button.setAttribute("aria-label", "Close");
            div.appendChild(button);
        }

        return;
    }

    document.getElementById("vote-form").requestSubmit();
});
