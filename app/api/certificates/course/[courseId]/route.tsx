// app/api/certificates/course/[courseId]/route.tsx

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  renderToStream,
} from "@react-pdf/renderer";
import { NextRequest } from "next/server";

const styles = StyleSheet.create({
  page: {
    padding: 45,
    backgroundColor: "#f8fafc",
    fontFamily: "Helvetica",
  },
  border: {
    border: "4px solid #111827",
    padding: 35,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  logo: {
    width: 85,
    height: 85,
    marginBottom: 18,
    objectFit: "contain",
  },
  small: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  title: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 26,
  },
  text: {
    fontSize: 16,
    color: "#334155",
    marginBottom: 10,
  },
  name: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#2563eb",
    marginVertical: 18,
  },
  course: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginVertical: 16,
    textAlign: "center",
  },
  footer: {
    marginTop: 45,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  footerText: {
    fontSize: 11,
    color: "#64748b",
    marginBottom: 4,
  },
  signatureBox: {
    alignItems: "center",
  },
  signature: {
    width: 150,
    height: 55,
    objectFit: "contain",
  },
  signatureLine: {
    marginTop: 6,
    width: 190,
    borderTop: "1px solid #111827",
    paddingTop: 6,
    textAlign: "center",
    fontSize: 10,
    color: "#475569",
  },
});

function CertificatePDF({
  userName,
  courseTitle,
  certificateNo,
  issuedAt,
}: {
  userName: string;
  courseTitle: string;
  certificateNo: string;
  issuedAt: string;
}) {
  // const logoPath = `${process.cwd()}/public/images/GreenLogo.png`;
  // const signaturePath = `${process.cwd()}/public/images/sig.png`;

  const logoPathSrc = `${process.cwd()}/public/images/GreenLogo.png`;
  const signaturePathSrc = `${process.cwd()}/public/images/sig.png`;
  
  const logoBase64 = fs.readFileSync(logoPathSrc).toString("base64");
  const signatureBase64 = fs.readFileSync(signaturePathSrc).toString("base64");
  
  const logoPath = `data:image/png;base64,${logoBase64}`;
  const signaturePath = `data:image/png;base64,${signatureBase64}`;


  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.border}>
          <Image src={logoPath} style={styles.logo} />

          <Text style={styles.small}>Certificate of Completion</Text>

          {/* <Text style={styles.title}>Bornomala Academy</Text> */}

          <Text style={styles.text}>This certificate is proudly presented to</Text>

          <Text style={styles.name}>{userName}</Text>

          <Text style={styles.text}>for successfully completing the course</Text>

          <Text style={styles.course}>{courseTitle}</Text>

          <Text style={styles.text}>
            Awarded in recognition of dedication, learning, and achievement.
          </Text>

          <View style={styles.footer}>
            <View>
              <Text style={styles.footerText}>Issued: {issuedAt}</Text>
              <Text style={styles.footerText}>
                Certificate ID: {certificateNo}
              </Text>
            </View>

            <View style={styles.signatureBox}>
              <Image src={signaturePath} style={styles.signature} />
              <Text style={styles.signatureLine}>Instructor Signature</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;

  const session = await auth();

  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return new Response("User not found", { status: 404 });
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      sections: {
        include: {
          lessons: {
            include: {
              progressRecords: {
                where: {
                  userId: user.id,
                  completed: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!course) {
    return new Response("Course not found", { status: 404 });
  }

  const access = await prisma.courseAccess.findUnique({
    where: {
      userId_courseId: {
        userId: user.id,
        courseId: course.id,
      },
    },
  });

  if (!access) {
    return new Response("No course access", { status: 403 });
  }

  const lessons = course.sections.flatMap((section) => section.lessons);
  const totalLessons = lessons.length;
  const completedLessons = lessons.filter(
    (lesson) => lesson.progressRecords.length > 0
  ).length;

  if (totalLessons === 0 || completedLessons < totalLessons) {
    return new Response("Course not completed", { status: 403 });
  }

  const certificateNo = `CERT-${course.id.slice(0, 6).toUpperCase()}-${user.id
    .slice(0, 6)
    .toUpperCase()}`;

  const certificate = await prisma.courseCertificate.upsert({
    where: {
      userId_courseId: {
        userId: user.id,
        courseId: course.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      courseId: course.id,
      certificateNo,
    },
  });

  const issuedAt = certificate.issuedAt.toLocaleDateString();

  const stream = await renderToStream(
    <CertificatePDF
      userName={user.name || user.email}
      courseTitle={course.title}
      certificateNo={certificate.certificateNo}
      issuedAt={issuedAt}
    />
  );

  return new Response(stream as any, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${course.slug}-certificate.pdf"`,
    },
  });
}