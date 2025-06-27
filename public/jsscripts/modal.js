document.addEventListener("DOMContentLoaded", () => {
  const openFileModal = document.querySelector("#file-open-modal");
  const openFolderModal = document.querySelector("#folder-open-modal");
  const fileModal = document.querySelector(".file-modal");
  const folderModal = document.querySelector(".folder-modal");
  const closeButtons = document.querySelectorAll(".close-button");
  const folderForm = document.querySelector("#folder-form");
  const folderName = document.querySelector("#folder");
  const submitButton = document.querySelector("#modal-submit-button");
  const folderRenameIcon = document.querySelectorAll(".folder-rename-icon");
  const editFileIcon = document.querySelectorAll(".edit-file-icon");

  const fileForm = document.querySelector("#file-form");
  const fileLabel = document.querySelector("#file-name-label");
  const fileInput = document.querySelector("#file");
  const folderSelect = document.querySelector("#folderId");

  openFileModal.addEventListener("click", () => {
    fileForm.action = "/upload";

    fileLabel.textContent = "File";

    fileInput.type = "file";
    fileInput.name = "file";

    console.log("Opening file modal");
    fileModal.showModal();
  });

  openFolderModal.addEventListener("click", () => {
    console.log("Opening folder modal");
    folderForm.action = "/create-folder";
    folderName.value = "";
    submitButton.textContent = "Create Folder";
    folderModal.showModal();
  });

  folderRenameIcon.forEach((icon) => {
    icon.addEventListener("click", () => {
      const folderId = icon.dataset.folderId;
      const oldFolderName = icon.dataset.folderName;
      folderForm.action = `/rename-folder/${folderId}`;
      folderName.value = oldFolderName;
      submitButton.textContent = "Confirm";
      folderModal.showModal();
      console.log("rename clicked");
    });
  });

  editFileIcon.forEach((icon) => {
    icon.addEventListener("click", () => {
      const fileId = icon.dataset.fileId;
      console.log("click");
      const olderFileName = icon.dataset.fileName;
      folderSelect.value = icon.dataset.folderId || "00";

      fileForm.action = `/edit-file/${fileId}`;

      fileLabel.textContent = "File name";

      fileInput.type = "text";
      fileInput.name = "fileName";
      fileInput.value = olderFileName;
      fileModal.showModal();
    });
  });

  fileModal.addEventListener("click", (e) => {
    const dialogDimensions = fileModal.getBoundingClientRect();
    if (
      e.clientX < dialogDimensions.left ||
      e.clientX > dialogDimensions.right ||
      e.clientY < dialogDimensions.top ||
      e.clientY > dialogDimensions.bottom
    ) {
      fileModal.close();
    }
  });

  closeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const parentDialog = btn.closest("dialog");
      if (parentDialog) parentDialog.close();
    });
  });
});
