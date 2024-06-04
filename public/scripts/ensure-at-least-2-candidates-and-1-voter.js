const add_poll_button = document.getElementById("add-poll");

add_poll_button.addEventListener("click", () => {
    let i = 0;

    while (document.getElementById(`candidates-${i}-title`)) {
        ++i;
    }

    const anyone_can_vote = document.getElementById("anyone-can-vote");
    let j = 0;

    if (anyone_can_vote.checked === false) {
        while (document.getElementById(`voters-${j}`)) {
            ++j;
        }
    }

    if (i < 2) {
        if (!(document.getElementById("alert-for-candidates"))) {
            const div = document.createElement("div");
            div.setAttribute("class", "alert alert-danger alert-dismissible " +
                "fade show");
            div.setAttribute("id", "alert-for-candidates");
            div.setAttribute("role", "alert");
            add_poll_button.parentNode.insertBefore(div, add_poll_button);

            div.appendChild(document.createTextNode("You must have at least " +
                "2 candidates!"));
            const button = document.createElement("button");
            button.setAttribute("type", "button");
            button.setAttribute("class", "btn-close");
            button.setAttribute("data-bs-dismiss", "alert");
            button.setAttribute("aria-label", "Close");
            div.appendChild(button);
        }
    } else if ((anyone_can_vote.checked === false) && (j < 1)) {
        if (!(document.getElementById("alert-for-voters"))) {
            const div = document.createElement("div");
            div.setAttribute("class", "alert alert-danger alert-dismissible " +
                "fade show");
            div.setAttribute("id", "alert-for-voters");
            div.setAttribute("role", "alert");
            add_poll_button.parentNode.insertBefore(div, add_poll_button);

            div.appendChild(document.createTextNode("You must have at least " +
                "1 voter!"));
            const button = document.createElement("button");
            button.setAttribute("type", "button");
            button.setAttribute("class", "btn-close");
            button.setAttribute("data-bs-dismiss", "alert");
            button.setAttribute("aria-label", "Close");
            div.appendChild(button);
        }
    } else {
        document.getElementById("add-poll-form").requestSubmit();
    }
});
