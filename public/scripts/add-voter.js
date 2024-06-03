const anyone_can_vote = document.getElementById("anyone-can-vote");

anyone_can_vote.addEventListener("click", () => {
    if (anyone_can_vote.checked === true) {
        const add_voter = document.getElementById("add-voter");
        if (add_voter) {
            add_voter.remove();
        }

        const main_div = document.getElementById("div-for-voters");
        if (main_div) {
            main_div.remove();
        }
    } else {
        const add_voter = document.createElement("span");
        add_voter.setAttribute("class", "btn btn-info");
        add_voter.setAttribute("id", "add-voter");
        add_voter.append(document.createTextNode("Add Voter"));

        const horizontal_rule =
            document.getElementById("horizontal-rule-for-add-voter");
        horizontal_rule.parentNode.insertBefore(add_voter, horizontal_rule);

        let voter_number = initial_voters;

        document.getElementById("add-voter").addEventListener("click", () => {
            const div = document.createElement("div");
            div.setAttribute("class", "col-6 mb-3");

            const select = document.createElement("select");
            select.setAttribute("class", "form-select");
            select.setAttribute("id", `voters-${voter_number}`);
            select.setAttribute("name", `voters[${voter_number}]`);
            for (let voter of voters) {
                const option = document.createElement("option");
                option.setAttribute("value", voter);
                option.appendChild(document.createTextNode(voter));
                select.appendChild(option);
            }
            div.appendChild(select);

            let main_div;

            if (voter_number === 0) {
                main_div = document.createElement("div");
                main_div.setAttribute("class", "row");
                main_div.setAttribute("id", "div-for-voters");
                const add_voter_button = document.getElementById("add-voter");
                add_voter_button.parentNode.insertBefore(main_div,
                    add_voter_button);

                const label = document.createElement("label");
                label.setAttribute("class", "form-label");
                label.appendChild(document.createTextNode("Voters"));
                main_div.appendChild(label);
            } else {
                main_div = document.getElementById("div-for-voters");
            }

            main_div.appendChild(div);

            ++voter_number;
        });
    }
});
