import { useEffect, useState } from "react";
import styles from "./select.module.css";

export type SelectOption = {
	label: string;
	value: string | number;
};

type MultipleSelectProps = {
	multiple: true;
	value: SelectOption[];
	onChange: (value: SelectOption[]) => void;
};

type SingleSelectProps = {
	multiple?: false;
	value?: SelectOption;
	onChange: (value: SelectOption | undefined) => void;
};

type SelectProps = {
	options: SelectOption[];
} & (SingleSelectProps | MultipleSelectProps);

export function Select({ multiple, value, onChange, options }: SelectProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [hightlightedIndex, setHighlightedIndex] = useState(0);

	function clearOptions() {
		multiple ? onChange([]) : onChange(undefined);
	}

	function selectOption(option: SelectOption) {
		if (multiple) {
			if (value.includes(option)) {
				onChange(value.filter((o) => o !== option));
			} else {
				onChange([...value, option]);
			}
		} else {
			if (option !== value) onChange(option);
		}
	}

	function isOptionSelected(option: SelectOption) {
		return multiple ? value.includes(option) : option === value;
	}

	function handleKeyboardNavigation(e: React.KeyboardEvent<HTMLDivElement>) {
		switch (e.code) {
			case "Enter":
			case "Space":
				setIsOpen((prev) => !prev);
				if (isOpen) selectOption(options[hightlightedIndex]);
				break;
			case "ArrowUp":
			case "ArrowDown": {
				if (!isOpen) {
					setIsOpen(true);
					break;
				}
				const newValue = hightlightedIndex + (e.code === "ArrowDown" ? 1 : -1);
				if (newValue >= 0 && newValue < options.length) {
					setHighlightedIndex(newValue);
				}
				break;
			}
			case "Escape":
				setIsOpen(false);
				break;
		}
	}

	useEffect(() => {
		if (isOpen) setHighlightedIndex(0);
	}, [isOpen]);

	return (
		<div
			onBlur={() => setIsOpen(false)}
			onKeyDown={handleKeyboardNavigation}
			onClick={() => setIsOpen((prev) => !prev)}
			tabIndex={0}
			className={styles.container}
			role="combobox"
			aria-haspopup="listbox"
			aria-expanded={isOpen}>
			<span className={styles.value} aria-label="Selected options">
				{multiple
					? value.map((v) => (
							<button
								key={v.value}
								onClick={(e) => {
									e.stopPropagation();
									selectOption(v);
								}}
								className={styles["option-badge"]}
								aria-label={`${v.label}, remove option`}>
								{v.label}
								<span className={styles["remove-btn"]}>&times;</span>
							</button>
					  ))
					: value?.label}
			</span>
			<button
				onClick={(e) => {
					e.stopPropagation();
					clearOptions();
				}}
				className={styles["clear-btn"]}
				aria-label="Clear options">
				&times;
			</button>
			<div className={styles.divider}></div>
			<div className={styles.caret} aria-hidden="true"></div>
			<ul
				className={`${styles.options} ${isOpen ? styles.show : ""}`}
				role="listbox">
				{options.map((option, index) => (
					<li
						onClick={(e) => {
							e.stopPropagation();
							selectOption(option);
							setIsOpen(false);
						}}
						onMouseEnter={() => setHighlightedIndex(index)}
						key={option.value}
						className={`${styles.option} ${
							isOptionSelected(option) ? styles.selected : ""
						} ${index === hightlightedIndex ? styles.highlighted : ""}`}
						role="option"
						aria-selected={isOptionSelected(option)}
						id={`option-${index}`}
						aria-labelledby={`option-${index}`}>
						{option.label}
					</li>
				))}
			</ul>
		</div>
	);
}

// make it WCAG compliant: ARIA roles + contrast
