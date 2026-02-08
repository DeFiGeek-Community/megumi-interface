"use client";
import { Link, LinkProps, Tooltip, Text, Image } from "@chakra-ui/react";
import { ReactNode } from "react";

interface SocialLinkProps extends LinkProps {
    href: string;
    label: string;
    icon?: ReactNode;
    imageSrc?: string;
}

export default function SocialLink({ href, label, icon, imageSrc, ...props }: SocialLinkProps) {
    return (
        <Tooltip hasArrow label={<Text whiteSpace={"pre-wrap"}>{label}</Text>}>
            <Link
                href={href}
                target={"_blank"}
                fontSize={"3xl"}
                width={"40px"}
                display="flex"
                alignItems="center"
                justifyContent="center"
                _hover={{ opacity: 0.8 }}
                padding={"0.3125rem"}
                {...props}
            >
                {imageSrc ? <Image w={"30px"} src={imageSrc} alt={label} /> : icon}
            </Link>
        </Tooltip>
    );
}
