let candidate_number = initial_candidates;
const add_candidate_button = document.getElementById("add-candidate");

add_candidate_button.addEventListener("click", () => {
    const main_div = document.createElement("div");
    main_div.setAttribute("class", "row");
    add_candidate_button.parentNode.
        insertBefore(main_div, add_candidate_button);

    const title_div = document.createElement("div");
    title_div.setAttribute("class", "col-6 mb-3");
    main_div.appendChild(title_div);

    const title_label = document.createElement("label");
    title_label.setAttribute("class", "form-label");
    title_label.setAttribute("for", `candidates-${candidate_number}-title`);
    title_label.appendChild(document.
        createTextNode("Candidate Title"));
    title_div.appendChild(title_label);

    const title_input = document.createElement("input");
    title_input.setAttribute("class", "form-control");
    title_input.setAttribute("type", "text");
    title_input.setAttribute("id", `candidates-${candidate_number}-title`);
    title_input.setAttribute("name", `candidates[${candidate_number}][title]`);
    title_input.required = true;
    title_div.appendChild(title_input);

    const images_div = document.createElement("div");
    images_div.setAttribute("class", "col-6 mb-3");
    main_div.appendChild(images_div);

    const images_label = document.createElement("label");
    images_label.setAttribute("class", "form-label");
    images_label.setAttribute("for", `candidates-${candidate_number}-images`);
    images_label.appendChild(document.createTextNode("Images"));
    images_div.appendChild(images_label);

    const images_input = document.createElement("input");
    images_input.setAttribute("class", "form-control");
    images_input.setAttribute("type", "file");
    images_input.setAttribute("id", `candidates-${candidate_number}-images`);
    images_input.setAttribute("name", `candidates-${candidate_number}-images`);
    images_input.multiple = true;
    images_div.appendChild(images_input);

    const description_div = document.createElement("div");
    description_div.setAttribute("class", "mb-2");
    main_div.appendChild(description_div);

    const description_label = document.createElement("label");
    description_label.setAttribute("class", "form-label");
    description_label.setAttribute("for",
        `candidates-${candidate_number}-description`);
    description_label.appendChild(document.createTextNode("Description"));
    description_div.appendChild(description_label);

    const description_input = document.createElement("input");
    description_input.setAttribute("class", "form-control");
    description_input.setAttribute("type", "text");
    description_input.setAttribute("id",
        `candidates-${candidate_number}-description`);
    description_input.setAttribute("name",
        `candidates[${candidate_number}][description]`);
    description_div.appendChild(description_input);

    const horizontal_rule = document.createElement("hr");
    add_candidate_button.parentNode.
        insertBefore(horizontal_rule, add_candidate_button);

    ++candidate_number;
});

// See ensure-at-least-2-candidates-and-1-voter.js
add_candidate_button.addEventListener("click", () => {
    const alert_for_candidates =
        document.getElementById("alert-for-candidates");

    if (alert_for_candidates) {
        alert_for_candidates.remove();
    }
});
