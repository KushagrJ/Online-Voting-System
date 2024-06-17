// ensure stuff === ensure at least 2 candidates, at least 1 voter, no empty
// voters and no duplicate voters

const add_or_update_poll_button = document.getElementById("add-or-update-poll");

add_or_update_poll_button.addEventListener("click", () => {
    let i = 0;

    while (document.getElementById(`candidates-${i}-title`)) {
        ++i;
    }

    let a = 0;

    while (true) {
        const candidate_delete =
            document.getElementById(`candidates-${a}-delete`);

        if (candidate_delete) {
            if (candidate_delete.checked === true) {
                --i;
            }
        } else {
            break;
        }

        ++a;
    }

    if (i < 2) {
        if (!(document.getElementById("alert-for-candidates"))) {
            const div = document.createElement("div");
            div.setAttribute("class", "alert alert-danger alert-dismissible " +
                "fade show");
            div.setAttribute("id", "alert-for-candidates");
            div.setAttribute("role", "alert");
            add_or_update_poll_button.parentNode.insertBefore(div,
                add_or_update_poll_button);

            div.appendChild(document.createTextNode("You must have at least " +
                "2 candidates!"));
            const button = document.createElement("button");
            button.setAttribute("type", "button");
            button.setAttribute("class", "btn-close");
            button.setAttribute("data-bs-dismiss", "alert");
            button.setAttribute("aria-label", "Close");
            div.appendChild(button);
        }

        return;
    }

    ////////////////////////////////////////////////////////////////////////////

    const anyone_can_vote = document.getElementById("anyone-can-vote");
    let j = 0;

    if (anyone_can_vote.checked === false) {
        while (document.getElementById(`voters-${j}`)) {
            ++j;
        }

        let b = 0;

        while (true) {
            const voter_delete = document.getElementById(`voters-${b}-delete`);

            if (voter_delete) {
                if (voter_delete.checked === true) {
                    --j;
                }
            } else {
                break;
            }

            ++b;
        }
    }

    if ((anyone_can_vote.checked === false) && (j < 1)) {
        if (!(document.getElementById("alert-for-voters"))) {
            const div = document.createElement("div");
            div.setAttribute("class", "alert alert-danger alert-dismissible " +
                "fade show");
            div.setAttribute("id", "alert-for-voters");
            div.setAttribute("role", "alert");
            add_or_update_poll_button.parentNode.insertBefore(div,
                add_or_update_poll_button);

            div.appendChild(document.createTextNode("You must have at least " +
                "1 voter!"));
            const button = document.createElement("button");
            button.setAttribute("type", "button");
            button.setAttribute("class", "btn-close");
            button.setAttribute("data-bs-dismiss", "alert");
            button.setAttribute("aria-label", "Close");
            div.appendChild(button);
        }

        return;
    }

    ////////////////////////////////////////////////////////////////////////////

    let x = 0;

    while (true) {
        const voter_select = document.getElementById(`voters-${x}`);

        if (voter_select) {
            if (voter_select.options[voter_select.selectedIndex].value === "") {
                if (!(document.getElementById("alert-for-empty-voters"))) {
                    const div = document.createElement("div");
                    div.setAttribute("class", "alert alert-danger " +
                        "alert-dismissible fade show");
                    div.setAttribute("id", "alert-for-empty-voters");
                    div.setAttribute("role", "alert");
                    add_or_update_poll_button.parentNode.insertBefore(div,
                        add_or_update_poll_button);

                    div.appendChild(document.createTextNode("You cannot have " +
                        "empty voters!"));
                    const button = document.createElement("button");
                    button.setAttribute("type", "button");
                    button.setAttribute("class", "btn-close");
                    button.setAttribute("data-bs-dismiss", "alert");
                    button.setAttribute("aria-label", "Close");
                    div.appendChild(button);
                }

                return;
            }
        } else {
            break;
        }

        ++x;
    }

    ////////////////////////////////////////////////////////////////////////////

    const voters = [];

    let y = 0;

    while (true) {
        const voter_select = document.getElementById(`voters-${y}`);

        if (voter_select) {
            voters.push(voter_select.options[voter_select.selectedIndex].value);
        } else {
            break;
        }

        ++y;
    }

    if (new Set(voters).size !== voters.length) {
        if (!(document.getElementById("alert-for-duplicate-voters"))) {
            const div = document.createElement("div");
            div.setAttribute("class", "alert alert-danger alert-dismissible " +
                "fade show");
            div.setAttribute("id", "alert-for-duplicate-voters");
            div.setAttribute("role", "alert");
            add_or_update_poll_button.parentNode.insertBefore(div,
                add_or_update_poll_button);

            div.appendChild(document.createTextNode("You cannot have " +
                "duplicate voters!"));
            const button = document.createElement("button");
            button.setAttribute("type", "button");
            button.setAttribute("class", "btn-close");
            button.setAttribute("data-bs-dismiss", "alert");
            button.setAttribute("aria-label", "Close");
            div.appendChild(button);
        }

        return;
    }

    ////////////////////////////////////////////////////////////////////////////

    let z = 0;

    while (true) {
        const voter_select = document.getElementById(`voters-${z}`);

        if (voter_select) {
            voter_select.disabled = false;
        } else {
            break;
        }

        ++z;
    }

    document.getElementById("poll-form").requestSubmit();
});
